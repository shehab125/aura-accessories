const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'admin.html');
let content = fs.readFileSync(p, 'utf8');

// Update showSection
content = content.replace("if (name === 'orders') loadOrders();", "if (name === 'orders') loadOrders();\n            if (name === 'custom-requests') loadCustomRequests();");

// Add loadCustomRequests function and price sumbit function after saveOrderChange
const newLogic = `
        async function loadCustomRequests() {
            try {
                const res = await fetch(\`\${API}/api/custom-requests\`, { headers: getHeaders() });
                const requests = await res.json();
                const container = document.getElementById('custom-requests-table');
                
                if (!Array.isArray(requests) || requests.length === 0) {
                    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-6);">لا توجد طلبات تصاميم خاصة حالياً.</p>';
                    return;
                }

                container.innerHTML = \`<table class="admin-table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>العميل</th>
                            <th>رقم الهاتف</th>
                            <th>الوصف</th>
                            <th>الحالة</th>
                            <th>تحديد السعر</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${requests.map(r => \`
                            <tr>
                                <td><img src="\${r.image_url}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="window.open('\${r.image_url}', '_blank')"></td>
                                <td>\${r.customer_name}</td>
                                <td dir="ltr" style="text-align:right;">\${r.customer_contact}</td>
                                <td><div style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="\${r.description}">\${r.description}</div></td>
                                <td><span class="badge \${r.status === 'priced' ? 'badge-success' : (r.status === 'ordered' ? 'badge-info' : 'badge-warning')}">\${r.status === 'priced' ? 'تم التسعير' : (r.status === 'ordered' ? 'تم الطلب' : 'قيد الانتظار')}</span></td>
                                <td>
                                    \${r.status === 'pending' || r.status === 'priced' ? \`<input type="number" id="cr-price-\${r.id}" value="\${r.price || ''}" placeholder="السعر" class="form-input" style="width:80px;padding:4px;height:auto;font-size:12px;">\` : \`EGP \${r.price}\`}
                                </td>
                                <td>
                                    \${(r.status === 'pending' || r.status === 'priced') ? \`<button class="btn btn-outline btn-sm" onclick="submitCustomRequestPrice('\${r.id}')">إرسال السعر</button>\` : '-'}
                                </td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>\`;
            } catch(e) {
                console.error(e);
                document.getElementById('custom-requests-table').innerHTML = '<p style="color:red;">حدث خطأ في تحميل الطلبات الخاصة</p>';
            }
        }

        async function submitCustomRequestPrice(id) {
            const priceInput = document.getElementById('cr-price-' + id);
            const price = parseFloat(priceInput.value);
            if (!price || isNaN(price)) {
                alert('الرجاء إدخال سعر صحيح.');
                return;
            }

            try {
                const res = await fetch(\`\${API}/api/custom-requests/\${id}\`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify({ price: price, status: 'priced' })
                });

                if (res.ok) {
                    alert('تم إرسال السعر بنجاح وجعله مرئياً للعميل.');
                    loadCustomRequests();
                } else {
                    const err = await res.json();
                    alert(err.error || 'فشل تحديث السعر');
                }
            } catch(e) {
                console.error(e);
                alert('حدث خطأ في الشبكة.');
            }
        }
`;

content = content.replace("async function saveOrderChange() {\n            if (!currentEditingOrder) return;", newLogic + "\n        async function saveOrderChange() {\n            if (!currentEditingOrder) return;");

fs.writeFileSync(p, content);
console.log('admin.html updated for custom requests');
