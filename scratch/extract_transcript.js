const fs = require('fs');
const path = 'C:/Users/Dell/.gemini/antigravity-ide/brain/0552ca4e-78bd-412d-a179-bb42bae1e92d/.system_generated/logs/transcript.jsonl';

const lines = fs.readFileSync(path, 'utf8').split('\n');
let recoveredParts = [];

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const entry = JSON.parse(lines[i]);
    if (entry.tool_responses) {
      for (const res of entry.tool_responses) {
        let textContent = '';
        if (res.response && res.response.output) {
          textContent = res.response.output;
        } else if (res.output) {
          textContent = res.output;
        } else {
          textContent = JSON.stringify(res);
        }
        
        if (textContent.includes('page.tsx')) {
           const match = textContent.match(/Showing lines (\d+) to (\d+)/);
           if (match) {
             const startLine = parseInt(match[1]);
             const endLine = parseInt(match[2]);
             
             // Check if file path matches page.tsx exactly
             const pathMatch = textContent.match(/File Path: `file:\/\/\/.*?visits\/page\.tsx`/);
             if (pathMatch) {
               const codeLines = [];
               let capturing = false;
               const entryLines = textContent.split('\n');
               for (const line of entryLines) {
                 if (line.match(/^\d+:/)) {
                   capturing = true;
                   codeLines.push(line.replace(/^\d+:\s?/, ''));
                 } else if (capturing && line.startsWith('The above content')) {
                   break;
                 } else if (capturing) {
                   codeLines.push(line);
                 }
               }
               
               recoveredParts.push({ startLine, endLine, code: codeLines.join('\n') });
             }
           }
        }
      }
    }
  } catch (e) {}
}

fs.writeFileSync('c:/Users/Dell/Documents/radja bekam/scratch/recovered_parts.json', JSON.stringify(recoveredParts, null, 2));
console.log(`Recovered ${recoveredParts.length} parts.`);
