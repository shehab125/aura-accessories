const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let replaced = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Match lines like: href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>">
  const newContent = content.replace(/<link rel="icon" type="image\/svg\+xml"[\s\n]*href="data:image\/svg\+xml,[^"]+">/g, '<link rel="icon" href="favicon.svg" type="image/svg+xml">');
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    replaced++;
  }
});
console.log('Replaced in ' + replaced + ' files.');
