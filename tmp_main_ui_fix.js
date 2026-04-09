const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'js', 'main.js');
let content = fs.readFileSync(p, 'utf8');

// 1. Add renderAuraFamily function
const teamLogic = `
function renderAuraFamily() {
  const container = document.getElementById('aura-family-grid');
  if (!container) return;

  const team = [
    { name: 'شهاب حسني', nameEn: 'Shehab Hosny', role: 'Founder & CEO', roleAr: 'المؤسس والمدير التنفيذي', initial: 'S' },
    { name: 'محمود مصطفى', nameEn: 'Mahmoud Mostafa', role: 'Head of Quality', roleAr: 'مدير الجودة', initial: 'M' }
  ];

  const lang = document.documentElement.lang || 'ar';

  container.innerHTML = team.map(m => \`
    <div class="glass-card reveal" style="text-align:center; padding: var(--space-8);">
      <div style="width:100px; height:100px; border-radius:50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); margin: 0 auto var(--space-4); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color: var(--black); font-weight:700; box-shadow: 0 8px 16px rgba(0,0,0,0.3);">
        \${m.initial}
      </div>
      <h4 style="margin-bottom: var(--space-1); color: var(--gold);">\${lang === 'ar' ? m.name : m.nameEn}</h4>
      <p style="color: var(--text-secondary); font-size: var(--text-xs); letter-spacing:1px; text-transform:uppercase;">\${lang === 'ar' ? m.roleAr : m.role}</p>
    </div>
  \`).join('');
}
`;

// 2. Add Profile Icon Injection
const navFixLogic = `
function injectProfileIcon() {
  const navIcons = document.querySelector('.nav-icons');
  if (navIcons && !navIcons.querySelector('a[href="account.html"]')) {
     const profileBtn = document.createElement('a');
     profileBtn.href = 'account.html';
     profileBtn.className = 'nav-icon-btn';
     profileBtn.title = 'حسابي';
     profileBtn.innerHTML = \`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>\`;
     navIcons.insertBefore(profileBtn, navIcons.firstChild);
  }
}
`;

// Insert functions before DOMContentLoaded
content = content.replace("document.addEventListener('DOMContentLoaded', async () => {", teamLogic + navFixLogic + "\ndocument.addEventListener('DOMContentLoaded', async () => {");

// Call functions in DOMContentLoaded
content = content.replace("await loadBlogPosts();", "await loadBlogPosts();\n  injectProfileIcon();\n  renderAuraFamily();");

// 3. Fix story pre-wrap in product page (ensure it has the class)
content = content.replace('white-space:pre-wrap;">', 'white-space:pre-wrap;" class="pre-wrap">');

fs.writeFileSync(p, content);
console.log('main.js updated with UI fixes');
