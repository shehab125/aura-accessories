/* ============================================
   AURA ACCESSORIES — Telegram Uploader Bot
   ============================================ */
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const geminiService = require('./geminiService');
const supabaseService = require('./supabaseService');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Cloudinary credentials (from admin.html configuration)
const CLOUDINARY_API_KEY = '661364937126525';
const CLOUDINARY_API_SECRET = '44_wa1y4N8hCnGFSn31log23WYw';
const CLOUDINARY_UPLOAD_PRESET = 'aura';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dqvvfwwya/auto/upload';

/**
 * Send a reply message to Telegram
 */
function sendReply(chatId, text, replyToMessageId = null) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_to_message_id: replyToMessageId
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(url, options);
  req.on('error', (err) => console.error('✦ Telegram reply error:', err));
  req.write(data);
  req.end();
}

/**
 * Download a file from Telegram as a Buffer
 */
function downloadTelegramFile(filePath) {
  const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

/**
 * Upload a remote Telegram image URL to Cloudinary
 */
function uploadToCloudinary(telegramFileUrl) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramString = `timestamp=${timestamp}&upload_preset=${CLOUDINARY_UPLOAD_PRESET}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(paramString).digest('hex');

  const postData = querystring.stringify({
    file: telegramFileUrl,
    api_key: CLOUDINARY_API_KEY,
    timestamp: timestamp,
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
    signature: signature
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(CLOUDINARY_URL, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data && data.secure_url) {
            resolve(data.secure_url);
          } else {
            reject(new Error(data.error?.message || 'Cloudinary upload failed'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Handle incoming Telegram update (used by both webhook and polling)
 */
async function handleUpdate(update) {
  if (!update || !update.message) return;

  const chatId = update.message.chat.id.toString();
  const messageId = update.message.message_id;

  // Security check: Only listen to messages from the configured admin chat ID(s)
  const allowedChats = TELEGRAM_CHAT_ID ? TELEGRAM_CHAT_ID.split(',').map(id => id.trim()) : [];
  if (allowedChats.length > 0 && !allowedChats.includes(chatId)) {
    console.log(`✦ Telegram Bot: Ignored message from unauthorized chat: ${chatId}`);
    
    // Only reply in private chats to avoid spamming groups
    if (update.message.chat.type === 'private') {
      sendReply(chatId, `❌ <b>غير مصرح باستخدام هذا البوت.</b>\n\nمعرف الشات الخاص بك هو: <code>${chatId}</code>\nيرجى إضافته إلى قائمة المعرفات المسموحة في إعدادات البيئة (TELEGRAM_CHAT_ID) لتفعيل البوت.`);
    }
    return;
  }

  // Check if message is /start
  if (update.message.text === '/start') {
    sendReply(chatId, '👋 <b>مرحباً بك في بوت أتمتة Aura Accessories!</b>\n\nأرسل لي صورة المنتج مع كتابة السعر في وصفها (الـ Caption)، وسأتولى تسمية المنتج وتوصيفه بالذكاء الاصطناعي ونشره فوراً على موقعك!');
    return;
  }

  // Process message if it contains a photo
  if (update.message.photo) {
    const photo = update.message.photo;
    // Get the highest resolution image
    const largestPhoto = photo[photo.length - 1];
    const fileId = largestPhoto.file_id;
    const caption = update.message.caption || '';

    // Extract price (any sequence of numbers)
    const priceMatch = caption.match(/\d+/);
    if (!priceMatch) {
      sendReply(chatId, '⚠️ <b>تنبيه:</b> لم أستطع العثور على السعر في الرسالة. يرجى إرسال الصورة وكتابة السعر كرقم في وصف الصورة (مثال: 250).', messageId);
      return;
    }
    const price = Number(priceMatch[0]);

    sendReply(chatId, '⏳ جاري معالجة الصورة بالذكاء الاصطناعي ورفعها للموقع...', messageId);

    try {
      // 1. Get file path from Telegram API
      const fileInfo = await new Promise((resolve, reject) => {
        https.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
          res.on('error', reject);
        });
      });

      if (!fileInfo.ok || !fileInfo.result?.file_path) {
        throw new Error('لم نتمكن من الحصول على مسار الملف من تليجرام.');
      }

      const filePath = fileInfo.result.file_path;
      const telegramFileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

      // 2. Download file to buffer for Gemini Vision processing
      const imageBuffer = await downloadTelegramFile(filePath);

      // 3. Analyze image using Gemini AI
      const geminiResult = await geminiService.analyzeProductImage(imageBuffer);

      // 4. Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(telegramFileUrl);

      // 5. Create product in Supabase database with 100 EGP added to the price
      const originalPrice = price;
      const finalPrice = price + 100;
      
      const newProduct = await supabaseService.createProduct({
        name: geminiResult.nameEn || 'New Accessory',
        nameAr: geminiResult.nameAr || 'منتج جديد',
        description: geminiResult.descriptionEn || '',
        descriptionAr: geminiResult.descriptionAr || '',
        price: finalPrice,
        gender: geminiResult.gender || 'women',
        category: geminiResult.category || 'necklaces',
        images: [cloudinaryUrl],
        rating: 5,
        reviews: 1,
        badge: 'جديد',
        hasCustomization: false
      });

      // 6. Send success response with link to product
      const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
      const successMessage = `
✅ <b>تم رفع المنتج بنجاح ونشره على الموقع!</b>
━━━━━━━━━━━━━
<b>الاسم (عربي):</b> ${newProduct.name_ar}
<b>الاسم (إنجليزي):</b> ${newProduct.name}
<b>السعر الأصلي:</b> ${originalPrice} ج.م
<b>السعر على الموقع (+100 ج.م):</b> ${newProduct.price} ج.م
<b>القسم:</b> ${newProduct.category}
<b>النوع:</b> ${newProduct.gender === 'women' ? 'نسائي' : newProduct.gender === 'men' ? 'رجالي' : 'للجنسين'}
━━━━━━━━━━━━━
🔗 <a href="${siteUrl}/product.html?id=${newProduct.id}">عرض المنتج على الموقع</a> | <a href="${siteUrl}/admin.html">تعديل التفاصيل من لوحة التحكم</a>
      `.trim();

      sendReply(chatId, successMessage, messageId);

    } catch (err) {
      console.error('✦ Telegram Uploader Bot Error:', err);
      sendReply(chatId, `❌ <b>حدث خطأ أثناء معالجة ورفع المنتج:</b>\n<code>${err.message}</code>`, messageId);
    }
  }
}

/**
 * Start updates polling loop (Used in local development)
 */
let offset = 0;
function startPolling() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('✦ Telegram Bot Token is missing, skipping Telegram Uploader Bot.');
    return;
  }
  console.log('✦ Telegram Uploader Bot: Starting in Polling Mode (Local).');
  
  function poll() {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
              offset = update.update_id + 1;
              handleUpdate(update).catch(err => {
                console.error("✦ Error handling Telegram update:", err);
              });
            }
          }
        } catch (e) {
          console.error("✦ Error parsing Telegram updates:", e);
        }
        setTimeout(poll, 1000);
      });
    }).on('error', (err) => {
      console.error("✦ Telegram polling connection error:", err);
      setTimeout(poll, 5000);
    });
  }
  
  poll();
}

let webhookRegistered = false;

function registerWebhookIfNeeded(siteUrl) {
  if (webhookRegistered) return;
  if (!TELEGRAM_BOT_TOKEN) return;
  
  // Only register if it's a secure production URL
  if (!siteUrl.startsWith('https://')) return;

  webhookRegistered = true; // Mark as true so we don't register repeatedly
  const webhookUrl = `${siteUrl}/api/telegram-webhook`;
  console.log(`✦ Telegram Bot: Dynamically registering Webhook at ${webhookUrl}`);
  
  const registerUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
  https.get(registerUrl, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('✦ Telegram Bot: Webhook Registration Result:', body);
    });
  }).on('error', (err) => {
    console.error('✦ Telegram Bot: Webhook Registration Error:', err);
    webhookRegistered = false; // Reset on error so we can try again
  });
}

// Fallback to polling mode only if NOT running on Vercel/Production
const isProductionOrVercel = process.env.VERCEL === '1' || (process.env.SITE_URL && process.env.SITE_URL.startsWith('https'));
if (!isProductionOrVercel) {
  startPolling();
}

module.exports = {
  handleUpdate,
  registerWebhookIfNeeded
};
