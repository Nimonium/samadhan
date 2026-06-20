import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import dbConnect from '../lib/db';
import Complaint from '../lib/models/Complaint';
import AuditLog from '../lib/models/AuditLog';
import Notification from '../lib/models/Notification'; // Ensure this model exists
import User from '../lib/models/User';
import mongoose from 'mongoose';
import '../socket-server';

// Simple Notification Model just for this phase if it doesn't exist
if (!mongoose.models.Notification) {
  const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });
  mongoose.model('Notification', notificationSchema);
}

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const complaintQueue = new Queue('complaints', { connection });

console.log('Worker starting up...');

export const jobHandler = async (job: { name: string; data?: any; id?: string }) => {
  await dbConnect();
  
  if (job.name === 'auto_confirm') {
    const { complaintId } = job.data;
    const complaint = await Complaint.findById(complaintId);
    
    if (complaint && complaint.status === 'resolved_pending_confirmation') {
      complaint.status = 'closed';
      complaint.autoClosedAt = new Date();
      complaint.closedAt = new Date();
      await complaint.save();

      await AuditLog.create({
        complaint: complaint._id,
        action: 'auto_closed',
        performedBy: null, // System
        fromStatus: 'resolved_pending_confirmation',
        toStatus: 'closed',
        note: 'Complaint auto-closed after 72 hours of citizen inactivity.',
      });
      console.log(`[Worker] Auto-closed complaint ${complaint.complaintId}`);
    }
  }

  if (job.name === 'sla_breach_scan') {
    const now = new Date();
    const breaches = await Complaint.find({
      status: { $in: ['submitted', 'routed', 'in_progress', 'reopened'] },
      slaDeadline: { $lt: now }
    });

    console.log(`[Worker] Scanning for SLA breaches. Found: ${breaches.length}`);

    for (const complaint of breaches) {
      if (!complaint.officer) continue;

      const officer = await User.findById(complaint.officer);
      if (!officer) continue;

      const admin = await User.findOne({ role: 'admin', department: complaint.department });

      // Notify officer
      await mongoose.models.Notification.create({
        user: officer._id,
        type: 'sla_breach_warning',
        complaint: complaint._id,
        message: `SLA Breached for complaint ${complaint.complaintId}`
      });

      // Notify admin
      if (admin) {
        await mongoose.models.Notification.create({
          user: admin._id,
          type: 'sla_breach_warning',
          complaint: complaint._id,
          message: `SLA Breached by ${officer.name} for complaint ${complaint.complaintId}`
        });
      }
    }
  }
};

const worker = new Worker('complaints', jobHandler, { connection });

worker.on('ready', () => {
  console.log('BullMQ Worker is ready to process jobs');
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed with error ${err.message}`);
});

// Setup repeatable SLA check every hour
async function setupSLAJob() {
  await complaintQueue.add('sla_breach_scan', {}, {
    repeat: {
      pattern: '0 * * * *' // Every hour
    }
  });
  console.log('SLA Breach scan job scheduled.');
}

setupSLAJob();
