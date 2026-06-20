const fs = require('fs');
const path = require('path');

function convertHtmlToJsx(html) {
  // Extract body content
  let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  // Basic conversions
  content = content.replace(/class=/g, 'className=');
  content = content.replace(/for=/g, 'htmlFor=');
  content = content.replace(/onclick=/g, 'onClick=');
  
  // Convert style="..." to style={{...}}
  content = content.replace(/style="([^"]*)"/g, (match, styleString) => {
    const styles = styleString.split(';').filter(s => s.trim() !== '');
    let styleObj = {};
    styles.forEach(s => {
      const [key, value] = s.split(':').map(str => str.trim());
      if (key && value) {
        // camelCase the key
        const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
        styleObj[camelKey] = value;
      }
    });
    return `style={${JSON.stringify(styleObj)}}`;
  });

  // Self-close tags: img, input, br, hr
  content = content.replace(/<(img|input|br|hr)([^>]*?)(?<!\/)>/g, '<$1$2 />');
  
  // Fix specific HTML issues (like unescaped entities if needed, but NextJS mostly handles standard ones)
  content = content.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
  content = content.replace(/<script[\s\S]*?<\/script>/gi, ''); // Remove script tags
  
  // Escape quotes
  content = content.replace(/"The leakage at the main junction pipe in Block C has been repaired\. The pressure has been tested and restored to normal\. Requesting user to verify flow at their end\."/g, '&quot;The leakage at the main junction pipe in Block C has been repaired. The pressure has been tested and restored to normal. Requesting user to verify flow at their end.&quot;');
  content = content.replace(/Yes, it's fixed/g, 'Yes, it&apos;s fixed');
  content = content.replace(/If you don't respond in 72 hours, we'll review this automatically/g, 'If you don&apos;t respond in 72 hours, we&apos;ll review this automatically');


  // Replace stitch placeholder images with a local dummy or simpler service
  content = content.replace(/src="https:\/\/lh3\.googleusercontent\.com[^"]+"/g, 'src="https://placehold.co/400x300/E2E8F0/1E293B?text=Placeholder"');

  return content;
}

const routes = [
  { file: 'citizen-intake.html', dest: 'src/app/complaints/new/page.tsx', name: 'CitizenIntake' },
  { file: 'citizen-tracking.html', dest: 'src/app/complaints/[id]/track/page.tsx', name: 'CitizenTracking' },
  { file: 'officer-dashboard.html', dest: 'src/app/officer/dashboard/page.tsx', name: 'OfficerDashboard' },
  { file: 'officer-detail.html', dest: 'src/app/officer/complaints/[id]/page.tsx', name: 'OfficerDetail' },
  { file: 'cm-dashboard.html', dest: 'src/app/cm/dashboard/page.tsx', name: 'CmDashboard' },
  { file: 'cm-mobile.html', dest: 'src/app/cm/field/page.tsx', name: 'CmMobile' }
];

routes.forEach(route => {
  const htmlPath = path.join('design-reference', route.file);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const jsx = convertHtmlToJsx(html);
  
  const destDir = path.dirname(route.dest);
  fs.mkdirSync(destDir, { recursive: true });

  const component = `
import React from 'react';

export default function ${route.name}() {
  return (
    <>
      ${jsx}
    </>
  );
}
`;

  fs.writeFileSync(route.dest, component);
  console.log('Converted ' + route.file + ' to ' + route.dest);
});
