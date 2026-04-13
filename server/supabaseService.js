/**
 * Supabase server-side client (uses service key, bypasses RLS).
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('MISSING SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Products
async function getProducts(activeOnly = true) {
  let q = supabase.from('products').select('*');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProductFromDb);
}

async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return mapProductFromDb(data);
}

async function createProduct(row) {
  const dbRow = mapProductToDb(row);
  const { data, error } = await supabase.from('products').insert([dbRow]).select().single();
  if (error) throw error;
  return data;
}

async function updateProduct(id, row) {
  const existing = await getProductById(id).catch(() => null);
  const toUpdate = mapProductToDb(row);
  if (existing && (toUpdate.images == null || (Array.isArray(toUpdate.images) && toUpdate.images.length === 0)))
    toUpdate.images = existing.images || [];
  const { data, error } = await supabase.from('products').update(toUpdate).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

function mapProductToDb(p) {
  const row = {};
  // Handle camelCase to snake_case and type conversion
  if (p.name !== undefined) row.name = p.name;
  if (p.nameAr !== undefined) row.name_ar = p.nameAr;
  if (p.description !== undefined) row.description = p.description;
  if (p.descriptionAr !== undefined) row.description_ar = p.descriptionAr;
  if (p.price !== undefined) row.price = Number(p.price) || 0;
  if (p.oldPrice !== undefined) row.old_price = p.oldPrice ? Number(p.oldPrice) : null;
  if (p.priceGold !== undefined) row.price_gold = p.priceGold ? Number(p.priceGold) : null;
  if (p.oldPriceGold !== undefined) row.old_price_gold = p.oldPriceGold ? Number(p.oldPriceGold) : null;
  if (p.priceSilver !== undefined) row.price_silver = p.priceSilver ? Number(p.priceSilver) : null;
  if (p.oldPriceSilver !== undefined) row.old_price_silver = p.oldPriceSilver ? Number(p.oldPriceSilver) : null;
  if (p.gender !== undefined) row.gender = p.gender;
  if (p.category !== undefined) row.category = p.category;
  if (p.material !== undefined) row.material = p.material;
  if (p.style !== undefined) row.style = p.style;
  if (p.color !== undefined) row.color = p.color;
  if (p.badge !== undefined) row.badge = p.badge;
  if (p.rating !== undefined) row.rating = Number(p.rating) || 0;
  if (p.reviews !== undefined) row.reviews = Number(p.reviews) || 0;
  if (p.occasion !== undefined) row.occasion = p.occasion;
  if (p.dimensions !== undefined) row.dimensions = p.dimensions;
  if (p.weight !== undefined) row.weight = p.weight;
  if (p.care !== undefined) row.care = p.care;
  if (p.story !== undefined) row.story = p.story;
  if (p.storyAr !== undefined) row.story_ar = p.storyAr;
  
  // Array fields
  if (p.sizes !== undefined) row.sizes = Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' ? p.sizes.split(',').map(s => s.trim()) : []);
  if (p.colors !== undefined) row.colors = Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? p.colors.split(',').map(s => s.trim()) : []);
  if (p.materials !== undefined) row.materials = Array.isArray(p.materials) ? p.materials : (typeof p.materials === 'string' ? p.materials.split(',').map(s => s.trim()) : []);
  
  // Image handling
  if (p.images !== undefined) row.images = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
  else if (p.image !== undefined) row.images = [p.image];

  // Customization fields
  if (p.hasCustomization !== undefined) row.has_customization = !!p.hasCustomization;
  if (p.customizationType !== undefined) row.customization_type = p.customizationType;
  if (p.customizationLimit !== undefined) row.customization_limit = Number(p.customizationLimit) || 1;
  if (p.customQuestions !== undefined) row.custom_questions = p.customQuestions;

  return row;
}

function mapProductFromDb(r) {
  if (!r) return r;
  return {
    ...r,
    nameAr: r.name_ar,
    descriptionAr: r.description_ar,
    oldPrice: r.old_price,
    priceGold: r.price_gold,
    oldPriceGold: r.old_price_gold,
    priceSilver: r.price_silver,
    oldPriceSilver: r.old_price_silver,
    storyAr: r.story_ar,
    hasCustomization: r.has_customization,
    customizationType: r.customization_type,
    customizationLimit: r.customization_limit,
    customQuestions: r.custom_questions,
  };
}

// --- Blog
async function getBlogPosts(publishedOnly = true) {
  let q = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
  if (publishedOnly) q = q.eq('is_published', true);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapBlogFromDb);
}

async function getAllBlogPosts() {
  const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapBlogFromDb);
}

async function createBlogPost(row) {
  const dbRow = mapBlogToDb(row);
  const { data, error } = await supabase.from('blog_posts').insert([dbRow]).select().single();
  if (error) throw error;
  return mapBlogFromDb(data);
}

async function updateBlogPost(id, row) {
  const { data, error } = await supabase.from('blog_posts').update(mapBlogToDb(row)).eq('id', id).select().single();
  if (error) throw error;
  return mapBlogFromDb(data);
}

async function deleteBlogPost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

function mapBlogFromDb(r) {
  if (!r) return r;
  return {
    ...r,
    image: r.image_url,
    date: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : null,
    active: r.is_published,
  };
}

function mapBlogToDb(p) {
  const row = { ...p };
  if (row.image !== undefined) { row.image_url = row.image; delete row.image; }
  if (row.date !== undefined) { row.published_at = row.date; delete row.date; }
  if (row.active !== undefined) { row.is_published = row.active; delete row.active; }
  if (row.titleAr !== undefined) { row.title_ar = row.titleAr; delete row.titleAr; }
  if (row.excerptAr !== undefined) { row.excerpt_ar = row.excerptAr; delete row.excerptAr; }
  if (row.contentAr !== undefined) { row.content_ar = row.contentAr; delete row.contentAr; }
  return row;
}

// --- Orders
async function getOrders(userId = null, isAdmin = false) {
  let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  if (!isAdmin && userId != null) q = q.eq('user_id', String(userId));
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapOrderFromDb);
}

async function createOrder(orderData, items) {
  // Ensure orderData fields are mapped from frontend names if necessary
  const orderRow = {
    user_id: orderData.userId ? String(orderData.userId) : (orderData.user_id ? String(orderData.user_id) : null),
    customer_name: orderData.customerName || orderData.customer_name,
    customer_phone: orderData.customerPhone || orderData.customer_phone,
    customer_email: orderData.customerEmail || orderData.customer_email,
    address: orderData.address,
    notes: orderData.notes,
    payment_method: orderData.payment_method || 'cod',
    status: 'pending',
    total: Number(orderData.total) || 0,
    coupon_code: orderData.couponCode || orderData.coupon_code || null,
    coupon_discount: Number(orderData.couponDiscount || orderData.coupon_discount) || 0,
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderRow])
    .select()
    .single();

  if (orderError) {
    console.error('Supabase Order Insert Error:', orderError);
    throw orderError;
  }

  const orderItems = (items || []).map(i => ({
    order_id: order.id,
    product_id: String(i.product_id || i.id),
    qty: Number(i.qty) || 1,
    price: Number(i.price) || 0,
    customization_value: i.customizationValue || i.customization_value || null,
    custom_answers: i.customAnswers || i.custom_answers || [],
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('Supabase OrderItems Insert Error:', itemsError);
    throw itemsError;
  }

  // Increment coupon usage
  if (orderRow.coupon_code) {
    const { data: coupon } = await supabase.from('coupons').select('id').ilike('code', orderRow.coupon_code).maybeSingle();
    if (coupon) {
      // Inline useCoupon logic to avoid issues with module.exports order
      const { data, error } = await supabase.rpc('increment_coupon_usage', { coupon_id: coupon.id }).catch(() => ({}));
      if (!data && !error) {
        const { data: current } = await supabase.from('coupons').select('used_count').eq('id', coupon.id).single();
        if (current) {
          await supabase.from('coupons').update({ used_count: (current.used_count || 0) + 1 }).eq('id', coupon.id);
        }
      }
    }
  }

  return mapOrderFromDb(order);
}

async function updateOrder(id, dataRow) {
  const status = dataRow.status;
  const admin_note = dataRow.admin_note !== undefined ? dataRow.admin_note : dataRow.adminNote;
  
  const toUpdate = {};
  if (status) toUpdate.status = status;
  if (admin_note !== undefined) toUpdate.admin_note = admin_note;
  
  console.log('Sending to Supabase:', toUpdate, 'for ID:', id);

  const { data, error } = await supabase.from('orders').update(toUpdate).eq('id', id).select().single();
  if (error) {
    console.error('Supabase Update Order Error:', error);
    throw error;
  }
  return mapOrderFromDb(data);
}



function mapOrderFromDb(r) {
  if (!r) return r;
  return {
    ...r,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    createdAt: r.created_at,
  };
}

// --- Ratings
async function getRatingsByProduct(productId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('product_id', String(productId))
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addRating(rating) {
  const row = {
    product_id: String(rating.product_id || rating.productId),
    user_id: String(rating.user_id || rating.userId),
    stars: Number(rating.stars),
    comment: rating.comment || null,
  };
  const { data, error } = await supabase.from('ratings').insert([row]).select().single();
  if (error) throw error;
  return data;
}


// --- Profiles (Standardized name for Supabase users table)
async function getUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getUserByEmail(email) {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function createUser(userData) {
  const { data, error } = await supabase.from('profiles').insert([userData]).select().single();
  if (error) throw error;
  return data;
}

async function updateUserPoints(userId, points) {
  const { data, error } = await supabase.from('profiles').update({ ora_points: points }).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

// --- Settings (Global app configuration)
async function getSettings() {
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'main').maybeSingle();
    if (error) throw error;
    return data?.data || {};
}

async function updateSettings(settingsData) {
    const { data, error } = await supabase.from('settings').upsert({ id: 'main', data: settingsData, updated_at: new Date() }).select().single();
    if (error) throw error;
    return data.data;
}

// --- Custom Requests
async function getCustomRequests() {
  const { data, error } = await supabase.from('custom_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getCustomRequestsByUser(userId) {
  const { data, error } = await supabase.from('custom_requests').select('*').eq('user_id', String(userId)).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function createCustomRequest(reqData) {
  const { data, error } = await supabase.from('custom_requests').insert([{
    user_id: reqData.userId ? String(reqData.userId) : null,
    customer_name: reqData.customerName,
    customer_contact: reqData.customerContact,
    image_url: reqData.imageUrl,
    description: reqData.description,
    status: 'pending'
  }]).select().single();
  if (error) {
    console.error('Supabase Custom Request Insert Error:', error);
    throw error;
  }
  return data;
}

async function updateCustomRequest(id, reqData) {
  const toUpdate = {};
  if (reqData.price !== undefined) toUpdate.price = reqData.price;
  if (reqData.status !== undefined) toUpdate.status = reqData.status;
  if (reqData.admin_note !== undefined) toUpdate.admin_note = reqData.admin_note;

  const { data, error } = await supabase.from('custom_requests').update(toUpdate).eq('id', id).select().single();
  if (error) {
    console.error('Supabase Custom Request Update Error:', error);
    throw error;
  }
  return data;
}

// --- Coupons
async function getCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getCouponByCode(code) {
  const { data, error } = await supabase.from('coupons').select('*').ilike('code', code).maybeSingle();
  if (error) throw error;
  return data;
}

async function createCoupon(couponData) {
  const row = {
    code: (couponData.code || '').toUpperCase().trim(),
    discount_type: couponData.discountType || couponData.discount_type,
    discount_value: Number(couponData.discountValue || couponData.discount_value),
    min_order_amount: Number(couponData.minOrderAmount || couponData.min_order_amount) || 0,
    max_uses: couponData.maxUses || couponData.max_uses || null,
    expires_at: couponData.expiresAt || couponData.expires_at || null,
    is_active: true,
  };
  const { data, error } = await supabase.from('coupons').insert([row]).select().single();
  if (error) throw error;
  return data;
}

async function deleteCoupon(id) {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

async function useCoupon(id) {
  const { data, error } = await supabase.rpc('increment_coupon_usage', { coupon_id: id }).catch(() => ({}));
  // Fallback: manual increment
  if (!data && !error) {
    const { data: current } = await supabase.from('coupons').select('used_count').eq('id', id).single();
    await supabase.from('coupons').update({ used_count: (current?.used_count || 0) + 1 }).eq('id', id);
  }
}

module.exports = {
  supabase,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBlogPosts,
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getOrders,
  createOrder,
  updateOrder,
  getRatingsByProduct,
  addRating,
  getUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUserPoints,
  getSettings,
  updateSettings,
  getCustomRequests,
  getCustomRequestsByUser,
  createCustomRequest,
  updateCustomRequest,
  getCoupons,
  getCouponByCode,
  createCoupon,
  deleteCoupon,
  useCoupon,
};
