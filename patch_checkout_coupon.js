const fs = require('fs');

const file = 'd:\\aura-accessories\\checkout.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add coupon input row between shipping row and the border-top divider in the summary
const couponHtml = `
                            <!-- Coupon Input -->
                            <div id="coupon-section" style="margin-bottom: var(--space-4);">
                                <div style="display:flex; gap: var(--space-2); align-items:center;">
                                    <input type="text" id="coupon-input" class="form-input" placeholder="كود الخصم" style="flex:1; height:38px; padding: var(--space-2) var(--space-3); font-size:var(--text-sm); text-transform:uppercase;" dir="ltr">
                                    <button type="button" id="apply-coupon-btn" class="btn btn-outline btn-sm" style="white-space:nowrap; height:38px;">تطبيق</button>
                                </div>
                                <div id="coupon-message" style="margin-top: var(--space-2); font-size: var(--text-xs); display:none;"></div>
                            </div>
                            <!-- Coupon discount row -->
                            <div id="coupon-discount-row" style="display:flex; justify-content:space-between; margin-bottom: var(--space-3); display:none;">
                                <span style="color: #2ecc71;">🏷️ خصم الكوبون</span>
                                <span id="checkout-coupon-discount" style="color:#2ecc71; font-weight:700;">-0 ج.م</span>
                            </div>`;

// Insert coupon section before the border-top divider
content = content.replace(
    `<div style="border-top: 1px solid var(--border-color); padding-top: var(--space-4); margin: var(--space-4) 0 var(--space-6);">`,
    couponHtml + `\n                        <div style="border-top: 1px solid var(--border-color); padding-top: var(--space-4); margin: var(--space-4) 0 var(--space-6);">`
);

// 2. Update renderCheckoutSummary to support coupon state
const oldRenderFn = `        function renderCheckoutSummary() {
            const cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
            const itemsEl = document.getElementById('checkout-items');
            const subtotalEl = document.getElementById('checkout-subtotal');
            const shippingEl = document.getElementById('checkout-shipping');
            const totalEl = document.getElementById('checkout-total');
            const oraEl = document.getElementById('checkout-ora-pts');
            const oraText = document.getElementById('checkout-ora-text');
            const lang = document.documentElement.lang || 'en';

            if (!cart.length) {
                itemsEl.innerHTML = '<p style="color:var(--text-secondary);">' + (lang === 'ar' ? 'سلتك فاضية' : 'Your cart is empty') + '. <a href="cart.html">' + (lang === 'ar' ? 'عربة التسوق' : 'Cart') + '</a></p>';
                subtotalEl.textContent = '0 ج.م';
                shippingEl.textContent = '0 ج.م';
                totalEl.textContent = '0 ج.م';
                if (oraEl) oraEl.style.display = 'none';
                document.getElementById('place-order-btn').disabled = true;
                return;
            }

            const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            const total = subtotal + shipping;
            const points = Math.floor(total / 10);`;

const newRenderFn = `        // Coupon state
        let appliedCoupon = null;
        let couponDiscountAmount = 0;

        function renderCheckoutSummary() {
            const cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
            const itemsEl = document.getElementById('checkout-items');
            const subtotalEl = document.getElementById('checkout-subtotal');
            const shippingEl = document.getElementById('checkout-shipping');
            const totalEl = document.getElementById('checkout-total');
            const oraEl = document.getElementById('checkout-ora-pts');
            const oraText = document.getElementById('checkout-ora-text');
            const lang = document.documentElement.lang || 'en';

            if (!cart.length) {
                itemsEl.innerHTML = '<p style="color:var(--text-secondary);">' + (lang === 'ar' ? 'سلتك فاضية' : 'Your cart is empty') + '. <a href="cart.html">' + (lang === 'ar' ? 'عربة التسوق' : 'Cart') + '</a></p>';
                subtotalEl.textContent = '0 ج.م';
                shippingEl.textContent = '0 ج.م';
                totalEl.textContent = '0 ج.م';
                if (oraEl) oraEl.style.display = 'none';
                document.getElementById('place-order-btn').disabled = true;
                return;
            }

            const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            const discountedSubtotal = Math.max(0, subtotal - couponDiscountAmount);
            const total = discountedSubtotal + shipping;
            const points = Math.floor(total / 10);

            // Show/hide coupon discount row
            const couponRow = document.getElementById('coupon-discount-row');
            if (couponRow) {
                if (couponDiscountAmount > 0) {
                    couponRow.style.display = 'flex';
                    document.getElementById('checkout-coupon-discount').textContent = '-' + couponDiscountAmount.toLocaleString() + ' ج.م';
                } else {
                    couponRow.style.display = 'none';
                }
            }`;

content = content.replace(oldRenderFn, newRenderFn);

// 3. Update total calculation in placeOrder to use discount
const oldTotalCalc = `            const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            const total = subtotal + shipping;`;

const newTotalCalc = `            const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            const total = Math.max(0, subtotal - couponDiscountAmount) + shipping;`;

content = content.replace(oldTotalCalc, newTotalCalc);

// 4. Update order payload to include coupon info
const oldPayload = `                        payment_method: 'cod',
                        total,
                        items`;
const newPayload = `                        payment_method: 'cod',
                        total,
                        couponCode: appliedCoupon ? appliedCoupon.code : null,
                        couponDiscount: couponDiscountAmount || 0,
                        items`;

content = content.replace(oldPayload, newPayload);

// 5. Add coupon application logic in DOMContentLoaded
const oldDomReady = `        document.addEventListener('DOMContentLoaded', () => {
            renderCheckoutSummary();
            document.getElementById('place-order-btn').addEventListener('click', placeOrder);
        });`;

const newDomReady = `        async function applyCoupon() {
            const codeInput = document.getElementById('coupon-input');
            const msgEl = document.getElementById('coupon-message');
            const btn = document.getElementById('apply-coupon-btn');
            const code = codeInput.value.trim().toUpperCase();
            if (!code) return;

            // If same coupon, remove it
            if (appliedCoupon && appliedCoupon.code === code) {
                appliedCoupon = null;
                couponDiscountAmount = 0;
                codeInput.value = '';
                msgEl.style.display = 'none';
                btn.textContent = 'تطبيق';
                renderCheckoutSummary();
                return;
            }

            btn.disabled = true;
            btn.textContent = '...';
            const cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
            const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            try {
                const res = await fetch(window.location.origin + '/api/coupons/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, orderTotal: subtotal })
                });
                const data = await res.json();
                if (res.ok && data.valid) {
                    appliedCoupon = data.coupon;
                    couponDiscountAmount = data.discountAmount;
                    msgEl.style.cssText = 'display:block; color:#2ecc71;';
                    msgEl.textContent = '✓ ' + data.message + ' (وفرت ' + data.discountAmount.toLocaleString() + ' ج.م)';
                    btn.textContent = 'إزالة';
                    renderCheckoutSummary();
                } else {
                    appliedCoupon = null;
                    couponDiscountAmount = 0;
                    msgEl.style.cssText = 'display:block; color:#e74c3c;';
                    msgEl.textContent = '✕ ' + (data.error || 'كود غير صالح');
                    btn.textContent = 'تطبيق';
                    renderCheckoutSummary();
                }
            } catch (e) {
                msgEl.style.cssText = 'display:block; color:#e74c3c;';
                msgEl.textContent = '✕ خطأ في الاتصال';
                btn.textContent = 'تطبيق';
            }
            btn.disabled = false;
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderCheckoutSummary();
            document.getElementById('place-order-btn').addEventListener('click', placeOrder);
            const applyBtn = document.getElementById('apply-coupon-btn');
            if (applyBtn) applyBtn.addEventListener('click', applyCoupon);
            const couponInput = document.getElementById('coupon-input');
            if (couponInput) couponInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') applyCoupon(); });
        });`;

content = content.replace(oldDomReady, newDomReady);

fs.writeFileSync(file, content, 'utf8');

// Verify
if (content.includes('applyCoupon') && content.includes('coupon-input') && content.includes('couponDiscountAmount')) {
    console.log('SUCCESS: checkout.html patched with coupon system!');
} else {
    console.log('WARNING: Some patch might be missing');
    if (!content.includes('applyCoupon')) console.log('  - Missing applyCoupon()');
    if (!content.includes('coupon-input')) console.log('  - Missing coupon-input field');
    if (!content.includes('couponDiscountAmount')) console.log('  - Missing couponDiscountAmount');
}
