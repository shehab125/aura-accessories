/* ============================================
   AURA ACCESSORIES — Express Server
   ============================================ */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseService = require('./supabaseService');

const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : (() => { try { return require('node-fetch'); } catch (_) { return null; } })();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not defined in .env');
    process.exit(1);
}
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

// ==========================================
// Database Helpers
// ==========================================
// ==========================================
// Database Helpers (REMOVED - Use supabaseService)
// ==========================================

// ==========================================
// Auth Middleware
// ==========================================
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function adminMiddleware(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
}

// ==========================================
// Auth Routes
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

        const existingUser = await supabaseService.getUserByEmail(email);
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await supabaseService.createUser({
            name,
            email,
            password: hashedPassword,
            role: 'customer',
            phone: req.body.phone || ''
        });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        console.error('Register error:', e);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await supabaseService.getUserByEmail(email);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await supabaseService.getUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (phone !== undefined) updates.phone = phone;

        const updatedUser = await supabaseService.updateUser(req.user.id, updates);
        res.json({ user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role } });
    } catch (e) {
        console.error('Profile update error:', e);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
app.put('/api/auth/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });

        const user = await supabaseService.getUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await supabaseService.updateUser(req.user.id, { password: hashedPassword });

        res.json({ success: true });
    } catch (e) {
        console.error('Password change error:', e);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// ==========================================
// Products Routes (Supabase)
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const products = await supabaseService.getProducts(true);
        res.json(products.map(p => ({ ...p, active: p.is_active, image: (p.images && p.images[0]) || p.image })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/products/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const products = await supabaseService.getProducts(false);
        res.json(products.map(p => ({ ...p, active: p.is_active, image: (p.images && p.images[0]) || p.image })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await supabaseService.getProductById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ ...product, active: product.is_active, image: (product.images && product.images[0]) || product.image });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Product not found' });
    }
});

app.post('/api/products', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await supabaseService.createProduct({ ...req.body, is_active: true });
        res.json({ ...product, active: product.is_active, image: (product.images && product.images[0]) || product.image });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const product = await supabaseService.updateProduct(id, req.body);
        res.json({ ...product, active: product.is_active, image: (product.images && product.images[0]) || product.image });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await supabaseService.deleteProduct(req.params.id);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ==========================================
// Orders Routes (Supabase)
// ==========================================
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await supabaseService.getOrders(req.user.id, req.user.role === 'admin');
        res.json(orders);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, customerEmail, address, notes, payment_method, total, items } = req.body;
        const userId = req.headers.authorization ? (() => { try { const t = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET); return t.id; } catch (_) { return null; } })() : null;
        const orderData = {
            userId,
            customerName: customerName || req.body.customer_name,
            customerPhone: customerPhone || req.body.customer_phone,
            customerEmail: customerEmail || req.body.customer_email,
            address,
            notes,
            payment_method: payment_method || 'cod',
            total: Number(total) || 0,
        };
        const order = await supabaseService.createOrder(orderData, items || []);
        // Award ORA points when order is delivered is done in updateOrderStatus
        res.json(order);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.put('/api/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await supabaseService.updateOrderStatus(req.params.id, status);

        if (status === 'delivered' && order.user_id) {
            const user = await supabaseService.getUserById(order.user_id);
            if (user) {
                const points = Math.floor((order.total || 0) / 10);
                const currentPoints = user.ora_points || user.aura_points || 0;
                await supabaseService.updateUser(user.id, { ora_points: currentPoints + points });
            }
        }
        res.json(order);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ==========================================
// Blog Routes (Supabase)
// ==========================================
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await supabaseService.getBlogPosts(true);
        res.json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load blog' });
    }
});

app.get('/api/blog/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const posts = await supabaseService.getAllBlogPosts();
        res.json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load blog' });
    }
});

app.post('/api/blog', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const post = await supabaseService.createBlogPost({ ...req.body, is_published: true, published_at: new Date().toISOString() });
        res.json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/blog/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const post = await supabaseService.updateBlogPost(req.params.id, req.body);
        res.json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.delete('/api/blog/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await supabaseService.deleteBlogPost(req.params.id);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// ==========================================
// Settings Routes
// ==========================================
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await supabaseService.getSettings();
        // Don't expose API key to public
        delete settings.openaiApiKey;
        delete settings.aimlApiKey;
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.get('/api/settings/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await supabaseService.getSettings();
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.put('/api/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await supabaseService.updateSettings(req.body);
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// ==========================================
// Users Routes (Admin)
// ==========================================
app.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
    const db = readDB();
    res.json(db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })));
});

app.put('/api/users/:id/role', authMiddleware, adminMiddleware, (req, res) => {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    db.users[idx].role = req.body.role;
    writeDB(db);
    res.json({ success: true });
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, (req, res) => {
    const db = readDB();
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    db.users = db.users.filter(u => u.id !== parseInt(req.params.id));
    writeDB(db);
    res.json({ success: true });
});

// ==========================================
// AI Design Route
// ==========================================
app.post('/api/ai/design', async (req, res) => {
    try {
        const { prompt, gender, budget } = req.body;
        const settings = await supabaseService.getSettings();

        // Prefer AIMLAPI (Gemini) if configured
        const aimlKey = settings.aimlApiKey;
        if (aimlKey && fetch) {
            const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${aimlKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: settings.designModel || settings.aimlModel || 'google/gemini-2.0-flash-exp',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert jewelry designer for Aura Accessories, a premium Egyptian accessories brand. Generate a detailed accessory design based on the user description. Respond in JSON only with these fields: name (English), nameAr (Arabic), description (English, 2-3 sentences), descriptionAr (Arabic, 2-3 sentences), material, stone, estimatedPrice (number in EGP, range 200-5000), style, occasion.'
                        },
                        {
                            role: 'user',
                            content: `Design request: ${prompt}. Gender: ${gender || 'unisex'}. Budget: ${budget || 'any'}.`
                        }
                    ],
                    max_tokens: 1000,
                    response_format: { type: 'json_object' }
                })
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('AIMLAPI error:', data);
                throw new Error('AI generation failed via AIMLAPI.');
            }
            const content = data.choices?.[0]?.message?.content || '{}';
            const design = JSON.parse(content);

            // Image Generation (AIMLAPI)
            if (settings.imageModel) {
                try {
                    const imgRes = await fetch('https://api.aimlapi.com/v1/images/generations', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${aimlKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: settings.imageModel,
                            prompt: `High-quality photorealistic studio shot of a ${design.material} ${design.style} ${design.name} jewelry piece. ${design.description}`,
                            n: 1,
                            size: '1024x1024'
                        })
                    });
                    if (imgRes.ok) {
                        const imgData = await imgRes.json();
                        if (imgData.data && imgData.data[0]) design.image_url = imgData.data[0].url;
                    }
                } catch (e) { console.error('Image gen failed via AIMLAPI', e); }
            }
            return res.json(design);
        }

        // Fallback to OpenAI if configured
        const apiKey = settings.openaiApiKey;
        if (apiKey) {
            const { OpenAI } = require('openai');
            const openai = new OpenAI({ apiKey });

            const completion = await openai.chat.completions.create({
                model: settings.designModel || settings.openaiModel || 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert jewelry designer for Aura Accessories, a premium Egyptian accessories brand. Generate a detailed accessory design based on the user's description. Respond in JSON format with these fields: name (English), nameAr (Arabic), description (English, 2-3 sentences), descriptionAr (Arabic, 2-3 sentences), material, stone, estimatedPrice (number in EGP, range 200-5000), style, occasion.`
                    },
                    {
                        role: 'user',
                        content: `Design request: ${prompt}. Gender: ${gender || 'unisex'}. Budget: ${budget || 'any'}.`
                    }
                ],
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            });

            const design = JSON.parse(completion.choices[0].message.content);

            // Image Generation (OpenAI)
            if (settings.imageModel) {
                try {
                    const imgRes = await openai.images.generate({
                        model: settings.imageModel,
                        prompt: `High-quality photorealistic studio shot of a ${design.material} ${design.style} ${design.name} jewelry piece. ${design.description}`,
                        n: 1,
                        size: '1024x1024'
                    });
                    if (imgRes.data && imgRes.data[0]) design.image_url = imgRes.data[0].url;
                } catch (e) { console.error('Image gen failed via OpenAI', e); }
            }
            return res.json(design);
        }

        // No AI configured – return demo message
        return res.json({
            name: 'AI Design Preview',
            nameAr: 'معاينة تصميم الذكاء الاصطناعي',
            description: 'To enable AI-powered designs, please add your AI/ML API key or OpenAI API key in the Admin Dashboard under Settings.',
            descriptionAr: 'لتفعيل التصاميم بالذكاء الاصطناعي، يرجى إضافة مفتاح AIMLAPI أو OpenAI في لوحة تحكم الأدمن تحت الإعدادات.',
            material: 'N/A',
            stone: 'N/A',
            estimatedPrice: 0,
            demo: true
        });
    } catch (e) {
        console.error('AI error:', e.message);
        res.status(500).json({ error: 'AI generation failed. Please check your configuration.' });
    }
});

// ==========================================
// AI Chat Route (public)
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const settings = await supabaseService.getSettings();

        // Fetch products for context
        let productList = [];
        try { productList = await supabaseService.getProducts(true); } catch (_) { productList = []; }
        const baseUrl = req.protocol + '://' + req.get('host');
        const productContext = productList.slice(0, 50).map(p =>
            `- ${p.name} (${p.name_ar || ''}) | ${p.category} | EGP ${p.price} | Link: ${baseUrl}/product.html?id=${p.id}`
        ).join('\n');

        const systemPrompt = `You are the official customer service agent for Aura Accessories, a premium Egyptian jewelry & accessories brand. You MUST answer in the SAME language the customer writes in (Arabic → Arabic, English → English). Be warm, helpful, concise, and professional.

Use the product catalog below to recommend items and provide direct links. For order inquiries, direct them to their account page (${baseUrl}/account.html). For returns/exchanges, mention the 14-day return policy. For custom designs, mention the AI design studio at ${baseUrl}/design.html.

Product Catalog:
${productContext}

Rules:
- Always provide product links when recommending items
- Keep responses under 150 words
- Use emojis sparingly for warmth
- Sign off as "Aura Support ✦"`;

        // Try AIMLAPI first
        const aimlKey = settings.aimlApiKey;
        if (aimlKey && fetch) {
            try {
                const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${aimlKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: settings.chatbotModel || settings.aimlModel || 'google/gemini-2.0-flash-exp',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: message.trim() }
                        ],
                        max_tokens: 400
                    })
                });
                const data = await response.json();
                const reply = data.choices?.[0]?.message?.content;
                if (reply) return res.json({ reply });
            } catch (aimlErr) { console.error('AIML chat error:', aimlErr.message); }
        }

        // Try OpenAI
        const openaiKey = settings.openaiApiKey;
        if (openaiKey) {
            try {
                const { default: OpenAI } = await import('openai');
                const openai = new OpenAI({ apiKey: openaiKey });
                const completion = await openai.chat.completions.create({
                    model: settings.chatbotModel || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message.trim() }
                    ],
                    max_tokens: 400
                });
                const reply = completion.choices[0]?.message?.content;
                if (reply) return res.json({ reply });
            } catch (openaiErr) { console.error('OpenAI chat error:', openaiErr.message); }
        }

        // Fallback: keyword-based product matching
        const lower = message.toLowerCase().trim();
        const isAr = /[\u0600-\u06FF]/.test(message);
        const matches = productList.filter(p =>
            lower.includes((p.name || '').toLowerCase()) ||
            (p.name_ar && message.includes(p.name_ar)) ||
            (p.category && lower.includes(p.category))
        );
        if (matches.length > 0) {
            const links = matches.slice(0, 3).map(p => `• ${p.name_ar || p.name}: ${baseUrl}/product.html?id=${p.id}`).join('\n');
            const reply = isAr ? `أهلاً بيك! 💛 من المنتجات اللي تناسبك:\n${links}\n\n— Aura Support ✦` : `Hi there! 💛 Here are some products you might like:\n${links}\n\n— Aura Support ✦`;
            return res.json({ reply });
        }
        const reply = isAr
            ? 'أهلاً بيك في أورا! 💛 قول اسم المنتج أو القسم (سلاسل، خواتم، اساور...) وهساعدك تلاقي اللي يناسبك. لو عندك استفسار عن طلب، ممكن تشيك من حسابك.\n\n— Aura Support ✦'
            : 'Welcome to Aura! 💛 Tell me what you\'re looking for (necklaces, rings, bracelets...) and I\'ll help you find the perfect piece. For order inquiries, check your account page.\n\n— Aura Support ✦';
        return res.json({ reply });
    } catch (e) {
        console.error('Chat AI error:', e.message);
        return res.status(500).json({ error: 'AI chat failed. Please try again later.' });
    }
});

// ==========================================
// Admin Chat — product-aware bot (uses DB products)
// ==========================================
app.post('/api/admin/chat', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });
        const products = await supabaseService.getProducts(false);
        const productList = products.slice(0, 50).map(p => ({
            id: p.id,
            name: p.name,
            name_ar: p.name_ar,
            category: p.category,
            price: p.price,
            description: (p.description || '').slice(0, 200)
        }));
        const settings = await supabaseService.getSettings();
        const apiKey = settings.openaiApiKey || settings.aimlApiKey;
        const baseUrl = req.protocol + '://' + req.get('host');
        const productContext = productList.map(p => `- ${p.name} (${p.name_ar || ''}) | ${p.category} | EGP ${p.price} | Link: ${baseUrl}/product.html?id=${p.id}`).join('\n');

        if (apiKey && settings.openaiApiKey) {
            const { OpenAI } = require('openai');
            const openai = new OpenAI({ apiKey: settings.openaiApiKey });
            const completion = await openai.chat.completions.create({
                model: settings.openaiModel || 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are Aura Accessories support bot. Answer in the same language as the user (Arabic or English). Use ONLY the following product list to suggest products or give links. Base URL for product links: ${baseUrl}/product.html?id=PRODUCT_ID\n\nProducts:\n${productContext}\n\nIf user asks for a product, give them the product link. If they ask about an order, say they can check their account or contact support. Keep replies concise.`
                    },
                    { role: 'user', content: message.trim() }
                ],
                max_tokens: 400
            });
            const reply = completion.choices[0]?.message?.content || 'عذراً، جرب مرة تانية.';
            return res.json({ reply });
        }

        if (apiKey && settings.aimlApiKey && fetch) {
            const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${settings.aimlApiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: settings.aimlModel || 'google/gemini-2.0-flash-exp',
                    messages: [
                        {
                            role: 'system',
                            content: `You are Aura Accessories support bot. Answer in the same language as the user. Use ONLY this product list. Product link format: ${baseUrl}/product.html?id=ID\n\n${productContext}\n\nGive product links when relevant. Keep replies short.`
                        },
                        { role: 'user', content: message.trim() }
                    ],
                    max_tokens: 400
                })
            });
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || 'عذراً، جرب مرة تانية.';
            return res.json({ reply });
        }

        // Fallback: simple keyword match and product links
        const lower = message.toLowerCase().trim();
        const ar = /[\u0600-\u06FF]/.test(message);
        const matches = productList.filter(p =>
            lower.includes((p.name || '').toLowerCase()) ||
            (p.name_ar && message.includes(p.name_ar)) ||
            (p.category && lower.includes(p.category))
        );
        if (matches.length > 0) {
            const links = matches.slice(0, 3).map(p => `${p.name_ar || p.name}: ${baseUrl}/product.html?id=${p.id}`).join('\n');
            const reply = ar ? `من المنتجات اللي تناسبك:\n${links}` : `Here are matching products:\n${links}`;
            return res.json({ reply });
        }
        const reply = ar ? 'لو حابب منتج معين قول اسمه أو القسم (قلادات، خواتم، إلخ) وهديك اللينك.' : 'Tell me a product name or category (necklaces, rings, etc.) and I\'ll give you the link.';
        return res.json({ reply });
    } catch (e) {
        console.error('Admin chat error:', e);
        res.status(500).json({ error: 'Chat failed.', reply: 'عذراً، حصل خطأ. جرب تاني.' });
    }
});

// ==========================================
// Dashboard Stats (Admin)
// ==========================================
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await supabaseService.getOrders(null, true);
        const products = await supabaseService.getProducts(false);
        const users = await supabaseService.getUsers();
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        res.json({
            totalProducts: products.length,
            totalOrders: orders.length,
            totalUsers: users.length,
            totalRevenue,
            recentOrders: orders.slice(0, 5),
            pendingOrders: orders.filter(o => o.status === 'pending').length
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// ==========================================
// Ratings (product reviews)
// ==========================================
app.get('/api/products/:id/ratings', async (req, res) => {
    try {
        const ratings = await supabaseService.getRatingsByProduct(req.params.id);
        res.json(ratings);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load ratings' });
    }
});

app.post('/api/ratings', authMiddleware, async (req, res) => {
    try {
        const { product_id, stars, comment } = req.body;
        if (!product_id || !stars || stars < 1 || stars > 5) return res.status(400).json({ error: 'Invalid rating' });
        const rating = await supabaseService.addRating({
            product_id,
            user_id: req.user.id,
            stars: Number(stars),
            comment: comment || null
        });
        res.json(rating);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to add rating' });
    }
});

// ==========================================
// User Admin Routes (Supabase)
// ==========================================
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await supabaseService.getUsers();
        res.json(users);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to load users' });
    }
});

app.put('/api/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'customer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
        const user = await supabaseService.updateUser(req.params.id, { role });
        res.json(user);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await supabaseService.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ==========================================
// Initialize Admin
// ==========================================
// ==========================================
// Initialize Admin
// ==========================================
async function initAdmin() {
    try {
        const admin = await supabaseService.getUserByEmail('admin@aura.com');
        if (!admin) {
            console.log('✦ Creating default admin account...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await supabaseService.createUser({
                email: 'admin@aura.com',
                password: hashedPassword,
                name: 'System Admin',
                phone: '0000000000',
                role: 'admin'
            });
            console.log('✦ Admin account created: admin@aura.com / admin123');
        } else {
            console.log('✦ Admin account exists (admin@aura.com)');
        }
    } catch (e) {
        console.error('Failed to initialize admin:', e);
    }
}

// ==========================================
// Cloudinary Signature Endpoint
// ==========================================
app.get('/api/upload/signature', authMiddleware, adminMiddleware, (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { upload_preset } = req.query;

    // Cloudinary signature format: sorted params + secret
    const str = `timestamp=${timestamp}&upload_preset=${process.env.CLOUDINARY_UPLOAD_PRESET || 'aura'}${process.env.CLOUDINARY_API_SECRET}`;
    const crypto = require('crypto');
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    res.json({
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'aura'
    });
});

// ==========================================
// Start Server
// ==========================================
if (process.env.VERCEL) {
    module.exports = app;   // Vercel serverless
} else if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n✦ Aura Accessories Server running on http://localhost:${PORT}\n`);
        initAdmin();
    });
}

module.exports = app;
