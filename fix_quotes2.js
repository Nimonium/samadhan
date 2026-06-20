const fs = require('fs');
let c = fs.readFileSync('src/app/complaints/[id]/track/page.tsx', 'utf8');

c = c.replace(/"The leakage/g, '&quot;The leakage');
c = c.replace(/their end."/g, 'their end.&quot;');

fs.writeFileSync('src/app/complaints/[id]/track/page.tsx', c);
