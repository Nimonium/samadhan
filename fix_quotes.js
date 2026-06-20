const fs = require('fs');
let c = fs.readFileSync('src/app/complaints/[id]/track/page.tsx', 'utf8');

c = c.replace(/"The leakage at the main junction pipe in Block C has been repaired\. The pressure has been\r?\ntested and restored to normal\. Requesting user to verify flow at their end\."/g, '&quot;The leakage at the main junction pipe in Block C has been repaired. The pressure has been\ntested and restored to normal. Requesting user to verify flow at their end.&quot;');
c = c.replace(/Yes, it's fixed/g, 'Yes, it&apos;s fixed');
c = c.replace(/If you don't respond in 72 hours, we'll review this automatically/g, 'If you don&apos;t respond in 72 hours, we&apos;ll review this automatically');

fs.writeFileSync('src/app/complaints/[id]/track/page.tsx', c);
