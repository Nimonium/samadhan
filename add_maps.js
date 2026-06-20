const fs = require('fs');

function addMap(file, mapPlaceholderRegex, mapComponent) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Add dynamic import
    const importStatement = `import dynamic from 'next/dynamic';\nconst Map = dynamic(() => import('@/components/Map'), { ssr: false });\n\nexport default function`;
    c = c.replace(/export default function/, importStatement);
    
    // Replace map placeholder with <Map />
    c = c.replace(mapPlaceholderRegex, mapComponent);
    
    fs.writeFileSync(file, c);
}

// 1. Citizen Intake
const intakeFile = 'src/app/complaints/new/page.tsx';
const intakeRegex = /<img alt="Map Selection"[\s\S]*?src="https:\/\/placehold\.co[^>]*\/>/g;
const intakeMap = `<Map />`;
addMap(intakeFile, intakeRegex, intakeMap);

// 2. Officer Detail
const officerFile = 'src/app/officer/complaints/[id]/page.tsx';
const officerRegex = /<img alt="Map View of Block C"[\s\S]*?src="https:\/\/placehold\.co[^>]*\/>/g;
const officerMap = `<Map />`;
addMap(officerFile, officerRegex, officerMap);
