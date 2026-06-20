/**
 * Mock integration for MCD311 API
 * This simulates pulling complaints from the MCD311 legacy system into Samadhan.
 */

export interface MCD311Complaint {
  mcd311Ref: string;
  title: string;
  description: string;
  category: 'roads' | 'water' | 'electricity' | 'sanitation' | 'law_order' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  district: string;
  source: 'mcd311';
  reportedAt: string;
}

export async function fetchMCD311Complaints(): Promise<MCD311Complaint[]> {
  try {
    if (process.env.MCD311_SIMULATE_FAILURE === 'true') {
      throw new Error('MCD311 API Gateway Timeout');
    }

    // Static array of sample complaints
    return [
      {
        mcd311Ref: 'MCD-2026-99120',
        title: 'Overflowing garbage bin',
        description: 'The main garbage bin near the community center has not been cleared for 3 days.',
        category: 'sanitation',
        priority: 'medium',
        district: 'South',
        source: 'mcd311',
        reportedAt: new Date().toISOString()
      },
      {
        mcd311Ref: 'MCD-2026-99121',
        title: 'Clogged street drain',
        description: 'Street drain is completely clogged causing mild waterlogging even without rain.',
        category: 'sanitation',
        priority: 'high',
        district: 'Central',
        source: 'mcd311',
        reportedAt: new Date().toISOString()
      },
      {
        mcd311Ref: 'MCD-2026-99122',
        title: 'Broken streetlight on Main Ave',
        description: 'Streetlight pole 45 is damaged and exposing live wires.',
        category: 'electricity',
        priority: 'critical',
        district: 'North',
        source: 'mcd311',
        reportedAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('[MCD311 Sync Error]:', error);
    throw error;
  }
}
