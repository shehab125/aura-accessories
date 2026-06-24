const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send a message to Telegram
 * @param {string} text - Message text
 */
async function sendTelegramMessage(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('✦ Telegram credentials missing, skipping notification.');
        return;
    }
    if (!text || text.trim() === '') {
        console.error('✦ Telegram error: Attempted to send empty message');
        return;
    }

    console.log('✦ Sending to Telegram:', text.substring(0, 50) + '...');

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const response = JSON.parse(body);
                console.log('✦ Telegram API Response:', JSON.stringify(response, null, 2));
                resolve(response);
            });
        });

        req.on('error', (err) => {
            console.error('✦ Telegram notification error:', err);
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

/**
 * Format and send order notification
 */
async function sendOrderNotification(order, items = []) {
    const orderId = order.order_number || (order.id ? order.id.slice(0, 8) : 'N/A');
    
    let itemsText = '';
    if (Array.isArray(items) && items.length > 0) {
        items.forEach((item, index) => {
            const itemName = item.name || `منتج ID: ${String(item.product_id || item.id).slice(0, 8)}`;
            itemsText += `\n📦 <b>المنتج ${index + 1}:</b> ${itemName}\n`;
            itemsText += `   • <b>الكمية:</b> ${item.qty} | <b>السعر:</b> ${item.price} ج.م\n`;
            
            const custVal = item.customization_value || item.customizationValue;
            if (custVal) {
                itemsText += `   • <b>التخصيص والطلاء:</b> ${custVal}\n`;
            }
            
            const answers = item.custom_answers || item.customAnswers;
            if (Array.isArray(answers) && answers.length > 0) {
                answers.forEach(ans => {
                    itemsText += `   • <b>${ans.question}:</b> ${ans.answer}\n`;
                });
            }
        });
    } else {
        itemsText = '\n⚠️ لا توجد تفاصيل للمنتجات في هذا الإخطار.\n';
    }

    const message = `
<b>🛍️ طلب أوردر جديد!</b>
━━━━━━━━━━━━━
<b>رقم الطلب:</b> #${orderId}
<b>العميل:</b> ${order.customer_name || 'غير معروف'}
<b>التليفون:</b> ${order.customer_phone || 'لا يوجد'}
<b>العنوان:</b> ${order.address || 'لا يوجد'}
<b>البريد الإلكتروني:</b> ${order.customer_email || 'لا يوجد'}
<b>ملاحظات العميل:</b> ${order.notes || 'لا يوجد'}
━━━━━━━━━━━━━
<b>📥 تفاصيل المنتجات:</b>${itemsText}
━━━━━━━━━━━━━
<b>الإجمالي:</b> ${order.total || 0} ج.م
<b>طريقة الدفع:</b> ${order.payment_method === 'cod' ? 'عند الاستلام' : 'أونلاين'}
━━━━━━━━━━━━━
<a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin.html">عرض الطلب في لوحة التحكم</a>
    `.trim();
    return sendTelegramMessage(message);
}

/**
 * Format and send custom request notification
 */
async function sendCustomRequestNotification(request) {
    const message = `
<b>✨ طلب تصميم خاص جديد!</b>
━━━━━━━━━━━━━
<b>العميل:</b> ${request.customer_name}
<b>التليفون:</b> ${request.customer_contact}
<b>الوصف:</b> ${request.description}
━━━━━━━━━━━━━
<b>صورة التصميم:</b> <a href="${request.image_url}">اضغط هنا لمشاهدة الصورة</a>
━━━━━━━━━━━━━
<a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin.html">فتح لوحة التحكم لتسعير الطلب</a>
    `;
    return sendTelegramMessage(message);
}

module.exports = {
    sendOrderNotification,
    sendCustomRequestNotification
};
