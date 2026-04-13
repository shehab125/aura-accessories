/* ============================================
   AURA ACCESSORIES — Express Server
   ============================================ */
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const supabaseService = require('./supabaseService');
const geminiService = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aura-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

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

        const existing = await supabaseService.getUserByEmail(email);
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await supabaseService.createUser({
            name,
            email,
            password: hashedPassword,
            role: 'customer',
            ora_points: 0
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
        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, ora_points: user.ora_points } });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==========================================
// Product Routes
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const activeOnly = req.query.admin !== 'true';
        const products = await supabaseService.getProducts(activeOnly);
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await supabaseService.getProductById(req.params.id);
        res.json(product);
    } catch (e) {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.post('/api/products', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await supabaseService.createProduct(req.body);
        res.json(product);
    } catch (e) {
        console.error('Create product error:', e);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await supabaseService.updateProduct(req.params.id, req.body);
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await supabaseService.deleteProduct(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ==========================================
// Blog Routes
// ==========================================
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await supabaseService.getBlogPosts(req.query.admin !== 'true');
        res.json(posts);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.post('/api/blog', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const post = await supabaseService.createBlogPost(req.body);
        res.json(post);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.put('/api/blog/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const post = await supabaseService.updateBlogPost(req.params.id, req.body);
        res.json(post);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.delete('/api/blog/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await supabaseService.deleteBlogPost(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

// ==========================================
// Order Routes
// ==========================================
app.get('/api/orders', authMiddleware, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    try {
        const orders = await supabaseService.getOrders(req.user.id, isAdmin);
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { order, items, ...flatOrder } = req.body;
        const finalOrder = order || flatOrder;
        
        // Handle guest vs logged-in user
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                finalOrder.userId = decoded.id;
            } catch (e) {
                // Invalid token, treat as guest but maybe log it
            }
        }

        if (!finalOrder.customerName && !finalOrder.customer_name) {
             return res.status(400).json({ error: 'Missing customer details' });
        }

        const newOrder = await supabaseService.createOrder(finalOrder, items || finalOrder.items);
        res.json(newOrder);
    } catch (e) {
        console.error('Order creation error:', e);
        res.status(500).json({ error: 'Failed to create order' });
    }
});


app.put('/api/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await supabaseService.updateOrder(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        console.error('Update order error:', e);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await supabaseService.getUsers();
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load users' });
    }
});

// ==========================================
// Settings Routes
// ==========================================
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await supabaseService.getSettings();
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.put('/api/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await supabaseService.updateSettings(req.body);
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Alias for admin panel
app.get('/api/settings/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await supabaseService.getSettings();
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

// ==========================================
// AI Chat Route (Gemini Integration)
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Get products to provide context even with Gemini's system prompt
        const productList = await supabaseService.getProducts();
        const baseUrl = req.protocol + '://' + req.get('host');
        const productSummary = productList.slice(0, 20).map(p => `- ${p.name}: ${baseUrl}/product.html?id=${p.id}`).join('\n');
        
        const contextualPrompt = `User Message: ${message}\n\nRelevant Products Context:\n${productSummary}`;
        
        // Transform incoming history to Gemini format if needed, but for now we rely on the prompt context
        const reply = await geminiService.getChatResponse(contextualPrompt, history || []);
        
        res.json({ reply });
    } catch (e) {
        console.error('AI Chat error:', e);
        res.status(500).json({ error: 'Chat failed.', reply: 'عذراً، حصل مشكلة في الربط مع الذكاء الاصطناعي. جرب تاني كمان شوية.' });
    }
} );
// ==========================================
// Coupon Routes
// ==========================================
app.get('/api/coupons', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const coupons = await supabaseService.getCoupons();
        res.json(coupons);
    } catch (e) {
        res.status(500).json({ error: 'Failed to load coupons' });
    }
});

app.post('/api/coupons', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const coupon = await supabaseService.createCoupon(req.body);
        res.json(coupon);
    } catch (e) {
        console.error('Create coupon error:', e);
        res.status(500).json({ error: e.message || 'Failed to create coupon' });
    }
});

app.delete('/api/coupons/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await supabaseService.deleteCoupon(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

// Public route: validate a coupon code
app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        if (!code) return res.status(400).json({ error: 'Coupon code is required' });

        const coupon = await supabaseService.getCouponByCode(code);
        if (!coupon || !coupon.is_active) {
            return res.status(404).json({ error: 'كود الخصم غير صالح' });
        }

        // Check expiry
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ error: 'كود الخصم منتهي الصلاحية' });
        }

        // Check max uses
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: 'تم استنفاذ عدد استخدامات هذا الكود' });
        }

        // Check minimum order amount
        const total = Number(orderTotal) || 0;
        if (coupon.min_order_amount && total < coupon.min_order_amount) {
            return res.status(400).json({ error: `الحد الأدنى للطلب هو EGP ${coupon.min_order_amount}` });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round((total * coupon.discount_value) / 100);
        } else {
            discountAmount = Math.min(coupon.discount_value, total);
        }

        res.json({
            valid: true,
            coupon,
            discountAmount,
            message: coupon.discount_type === 'percentage'
                ? `تم تطبيق خصم ${coupon.discount_value}%`
                : `تم تطبيق خصم EGP ${coupon.discount_value}`
        });
    } catch (e) {
        console.error('Coupon validate error:', e);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==========================================
// Custom Requests Routes
// ==========================================
app.get('/api/custom-requests', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const requests = await supabaseService.getCustomRequests();
        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/custom-requests/my', authMiddleware, async (req, res) => {
    try {
        const requests = await supabaseService.getCustomRequestsByUser(req.user.id);
        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.post('/api/custom-requests', async (req, res) => {
    try {
        const reqData = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                reqData.userId = decoded.id;
            } catch (e) {}
        }
        const created = await supabaseService.createCustomRequest(reqData);
        res.json(created);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create custom request' });
    }
});

app.put('/api/custom-requests/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updated = await supabaseService.updateCustomRequest(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update custom request' });
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
// Initialize Admin
// ==========================================
async function initAdmin() {
    try {
        const admin = await supabaseService.getUserByEmail('admin@aura.com');
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await supabaseService.createUser({
                name: 'Admin',
                email: 'admin@aura.com',
                password: hashedPassword,
                role: 'admin',
                ora_points: 0
            });
            console.log('✦ Admin account initialized in Supabase (admin@aura.com / admin123)');
        }
    } catch (e) {
        console.error('Init admin error:', e);
    }
}

// ==========================================
// Start Server
// ==========================================
const server = app.listen(PORT, () => {
    console.log(`\n✦ Aura Accessories Server running on http://localhost:${PORT}\n`);
    initAdmin();
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${PORT} is already in use.`);
        console.error(`Please stop the previous server instance or use a different port.\n`);
        process.exit(1);
    } else {
        console.error('Server error:', e);
    }
});
