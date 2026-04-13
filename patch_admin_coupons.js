const fs = require('fs');

const file = 'd:\\aura-accessories\\admin.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add coupons to showSection function
content = content.replace(
    "if (name === 'settings') loadSettings();",
    "if (name === 'settings') loadSettings();\n            if (name === 'coupons') loadCoupons();"
);

// 2. Add coupon JS functions before the closing </script> tag
const couponFunctions = `
        // ==========================================
        // Coupons
        // ==========================================
        async function loadCoupons() {
            try {
                const res = await fetch(\`\${API}/api/coupons\`, { headers: getHeaders() });
                const coupons = await res.json();
                const container = document.getElementById('coupons-table');
                if (!Array.isArray(coupons) || coupons.length === 0) {
                    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:var(--space-6);">لا توجد كوبونات حالياً. أضف أول كوبون خصم!</p>';
                    return;
                }
                container.innerHTML = \`<table class="admin-table">
                    <thead>
                        <tr>
                            <th>الكود</th>
                            <th>النوع</th>
                            <th>الخصم</th>
                            <th>الحد الأدنى</th>
                            <th>الاستخدامات</th>
                            <th>تاريخ الانتهاء</th>
                            <th>الحالة</th>
                            <th>حذف</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${coupons.map(c => \`
                            <tr>
                                <td><code style="background:rgba(212,175,55,0.1);padding:2px 8px;border-radius:4px;color:var(--gold);font-size:0.85rem;">\${c.code}</code></td>
                                <td>\${c.discount_type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}</td>
                                <td style="color:var(--gold);font-weight:700;">\${c.discount_type === 'percentage' ? c.discount_value + '%' : 'EGP ' + c.discount_value}</td>
                                <td>\${c.min_order_amount > 0 ? 'EGP ' + c.min_order_amount : '—'}</td>
                                <td>\${c.used_count}\${c.max_uses ? ' / ' + c.max_uses : ' / ∞'}</td>
                                <td>\${c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-EG') : 'بدون انتهاء'}</td>
                                <td><span class="badge \${c.is_active ? 'badge-success' : ''}" style="\${!c.is_active ? 'background:rgba(231,76,60,0.15);color:#e74c3c;' : ''}">\${c.is_active ? 'فعّال' : 'معطّل'}</span></td>
                                <td><button class="btn-danger" onclick="deleteCoupon('\${c.id}')">حذف</button></td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>\`;
            } catch (e) {
                console.error(e);
                document.getElementById('coupons-table').innerHTML = '<p style="color:red;">خطأ في تحميل الكوبونات</p>';
            }
        }

        function openCouponModal() {
            document.getElementById('coupon-form').reset();
            document.getElementById('coupon-modal').classList.add('active');
        }

        async function deleteCoupon(id) {
            if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
            try {
                const r = await fetch(\`\${API}/api/coupons/\${id}\`, { method: 'DELETE', headers: getHeaders() });
                if (r.ok) { loadCoupons(); } else { alert('فشل الحذف'); }
            } catch (e) { alert('خطأ في الاتصال'); }
        }

        document.getElementById('coupon-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd);
            const payload = {
                code: data.code,
                discountType: data.discountType,
                discountValue: Number(data.discountValue),
                minOrderAmount: Number(data.minOrderAmount) || 0,
                maxUses: data.maxUses ? Number(data.maxUses) : null,
                expiresAt: data.expiresAt || null,
            };
            try {
                const r = await fetch(\`\${API}/api/coupons\`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
                const result = await r.json();
                if (r.ok) {
                    alert('تم إضافة الكوبون بنجاح! الكود: ' + result.code);
                    closeModal('coupon-modal');
                    loadCoupons();
                } else {
                    alert(result.error || 'فشل إضافة الكوبون');
                }
            } catch (err) {
                alert('خطأ في الاتصال.');
            }
        });

`;

// Insert before the last </script> tag
content = content.replace('        // Init\n    </script>', couponFunctions + '        // Init\n    </script>');

if (content.includes('loadCoupons')) {
    console.log('SUCCESS: loadCoupons function added!');
} else {
    console.log('WARNING: Insertion may have failed');
}

fs.writeFileSync(file, content, 'utf8');
console.log('File saved successfully!');
