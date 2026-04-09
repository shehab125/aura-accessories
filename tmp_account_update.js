const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'account.html');
let content = fs.readFileSync(p, 'utf8');

// 1. Add call to loadCustomRequests in initDashboard
content = content.replace('loadOrders();', 'loadOrders();\n            loadCustomRequests();');

// 2. Add custom requests logic to the script section
const customLogic = `
        async function loadCustomRequests() {
            try {
                const res = await fetch(\`\${API}/api/custom-requests/my\`, { headers: getHeaders() });
                const requests = await res.json();
                renderCustomRequests(requests);
            } catch (e) {
                console.error('Custom requests load error:', e);
            }
        }

        function renderCustomRequests(requests) {
            const listEl = document.getElementById('designs-list');
            document.getElementById('stat-designs').textContent = requests.length;

            if (!requests.length) {
                listEl.innerHTML = '<p style="color: var(--text-secondary); text-align:center; padding: var(--space-6);">لا توجد طلبات تصاميم خاصة بعد. <a href="design.html" style="color: var(--gold);">صمم أورا الخاصة بك ←</a></p>';
                return;
            }

            listEl.innerHTML = requests.map(r => \`
                <div class="order-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-4); background: rgba(255,255,255,0.02);">
                    <div style="display:flex; gap: var(--space-6); align-items: flex-start;">
                        <img src="\${r.image_url}" style="width:100px; height:100px; object-fit:cover; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: var(--space-2);">
                                <h4 style="color: var(--gold); font-size: var(--text-base);">طلب تصميم خاص</h4>
                                <span class="badge \${r.status === 'priced' ? 'badge-success' : (r.status === 'ordered' ? 'badge-info' : 'badge-warning')}" style="padding: 4px 12px; border-radius: 100px; font-size: 10px;">\${
                                    r.status === 'priced' ? 'تم تحديد السعر' : 
                                    r.status === 'ordered' ? 'تم الطلب' : 
                                    'قيد المراجعة'
                                }</span>
                            </div>
                            <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-3); max-width: 400px;">\${r.description}</p>
                            
                            \${r.price ? \`
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px dashed var(--border-color);">
                                    <div style="font-size: var(--text-lg); font-weight:700; color: var(--gold);">\${r.price.toLocaleString()} ج.م</div>
                                    \${r.status === 'priced' ? \`
                                        <button class="btn btn-primary btn-sm" onclick="addToCartCustom('\${r.id}', \${r.price}, '\${r.image_url}', '\${r.description.substring(0,20)}')">
                                            إضافة للعربة وشراء
                                        </button>
                                    \` : '<span style="color: var(--text-secondary); font-size: var(--text-sm);">تمت الإضافة للطلب</span>'}
                                </div>
                            \` : '<p style="font-size: var(--text-xs); color: var(--gold); opacity:0.8;">سيعلمك الفريق بالسعر فور مراجعة التصميم.</p>'}
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        async function addToCartCustom(requestId, price, image, nameSnippet) {
            const cartItem = {
                id: 'custom-' + requestId,
                name: 'تصميم خاص - ' + nameSnippet + '...',
                nameAr: 'تصميم خاص - ' + nameSnippet + '...',
                price: price,
                image: image,
                quantity: 1,
                isCustom: true,
                requestId: requestId
            };

            // Get existing cart
            let cart = JSON.parse(localStorage.getItem('aura_cart') || '[]');
            
            // Remove any existing version of this custom request
            cart = cart.filter(item => item.requestId !== requestId);
            
            // Add new one
            cart.push(cartItem);
            
            localStorage.setItem('aura_cart', JSON.stringify(cart));
            
            if (window.showToast) {
                showToast('تمت إضافة التصميم المخصص للعربة', 'success');
            } else {
                alert('تمت إضافة التصميم المخصص للعربة');
            }
            
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 800);
        }

        async function loadOrders() {`;

content = content.replace('async function loadOrders() {', customLogic);

fs.writeFileSync(p, content);
console.log('Account page updated');
