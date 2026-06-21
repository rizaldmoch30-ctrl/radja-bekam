const fs = require('fs');
const transcriptPath = 'C:/Users/Dell/.gemini/antigravity-ide/brain/0552ca4e-78bd-412d-a179-bb42bae1e92d/.system_generated/logs/transcript.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
let fullContent = null;

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  try {
    const entry = JSON.parse(lines[i]);
    if (entry.type === 'ACTION_RESPONSE' && entry.content && entry.content.includes('The following is the entire, complete file contents of the requested file.')) {
      if (entry.content.includes('src/app/admin/visits/page.tsx')) {
        // Extract the content
        // Format: The following code has been modified to include a line number...
        // 1: code...
        // The above content shows the entire, complete file contents...
        const linesOfCode = entry.content.split('\n');
        let codeLines = [];
        let capturing = false;
        for (const line of linesOfCode) {
          if (line.match(/^\d+:/)) {
            capturing = true;
            codeLines.push(line.replace(/^\d+:\s?/, ''));
          } else if (capturing && line.startsWith('The above content')) {
            break;
          } else if (capturing) {
             // maybe empty lines?
             if (line.trim() === '') {
                codeLines.push('');
             }
          }
        }
        if (codeLines.length > 0) {
           fullContent = codeLines.join('\n');
           break;
        }
      }
    }
  } catch (e) {}
}

if (fullContent) {
  fs.writeFileSync('c:/Users/Dell/Documents/radja bekam/src/app/admin/visits/page_recovered.tsx', fullContent);
  console.log("Recovered file to page_recovered.tsx with length: " + fullContent.split('\n').length);
} else {
  console.log("Could not find full file content in transcript.");
}
