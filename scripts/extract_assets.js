const fs = require('fs');
const path = require('path');

function cleanContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const separator = '\n---\n\n';
  const idx = content.indexOf(separator);
  if (idx !== -1) {
    return content.substring(idx + separator.length);
  }
  return content;
}

const cssSource = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\9e153c42-dc79-4af2-bd68-90c453cbf531\\.system_generated\\steps\\23\\content.md';
const jsSource = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\9e153c42-dc79-4af2-bd68-90c453cbf531\\.system_generated\\steps\\22\\content.md';

const cssContent = cleanContent(cssSource);
const jsContent = cleanContent(jsSource);

fs.writeFileSync(path.join(__dirname, '../public/style.css'), cssContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/css/style.css'), cssContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/script.js'), jsContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/js/script.js'), jsContent, 'utf8');

console.log('CSS length:', cssContent.length);
console.log('JS length:', jsContent.length);
console.log('Extraction complete!');
