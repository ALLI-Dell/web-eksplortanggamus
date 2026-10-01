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

const htmlSource = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\9e153c42-dc79-4af2-bd68-90c453cbf531\\.system_generated\\steps\\6\\content.md';
const dataSource = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\9e153c42-dc79-4af2-bd68-90c453cbf531\\.system_generated\\steps\\35\\content.md';

const htmlContent = cleanContent(htmlSource);
const dataContent = cleanContent(dataSource);

fs.writeFileSync(path.join(__dirname, '../public/index.html'), htmlContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../views/index.ejs'), htmlContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../public/data.json'), dataContent, 'utf8');

console.log('HTML length:', htmlContent.length);
console.log('Data JSON length:', dataContent.length);
console.log('HTML and Data extraction complete!');
