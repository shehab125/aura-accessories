/**
 * Supabase server-side client (uses service key, bypasses RLS).
 * Set env SUPABASE_URL and SUPABASE_SERVICE_KEY or use defaults for dev.
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('FATAL: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Products
async function getProducts(activeOnly = true) {
  let q = supabase.from('products').select('*');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function createProduct(row) {
  const { data, error } = await supabase.from('products').insert([mapProductToDb(row)]).select().single();
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
  const row = { ...p };
  if (row.id && typeof row.id === 'number') delete row.id;
  if (row.active !== undefined) { row.is_active = row.active; delete row.active; }
  if (Array.isArray(row.images)) row.images = row.images;
  else if (!row.images) row.images = [];
  return row;
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
  let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (!isAdmin && userId != null) q = q.eq('user_id', String(userId));
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapOrderFromDb);
}

async function createOrder(orderData, items) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: orderData.userId != null ? String(orderData.userId) : null,
      customer_name: orderData.customerName || orderData.customer_name,
      customer_phone: orderData.customerPhone || orderData.customer_phone,
      customer_email: orderData.customerEmail || orderData.customer_email,
      address: orderData.address,
      notes: orderData.notes,
      payment_method: orderData.payment_method || 'cod',
      status: 'pending',
      total: orderData.total,
    }])
    .select()
    .single();
  if (orderError) throw orderError;

  const orderItems = (items || []).map(i => ({
    order_id: order.id,
    product_id: i.product_id || i.id,
    qty: i.qty || 1,
    price: i.price || 0,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return mapOrderFromDb(order);
}

async function updateOrderStatus(id, status) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw error;
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
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addRating(rating) {
  const row = {
    product_id: rating.product_id,
    user_id: String(rating.user_id),
    stars: rating.stars,
    comment: rating.comment || null,
  };
  const { data, error } = await supabase.from('ratings').insert([row]).select().single();
  if (error) throw error;
  return data;
}

// --- Settings (assuming 'settings' table with id=1, config jsonb)
async function getSettings() {
  const { data, error } = await supabase.from('settings').select('config').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return {};
  return data.config || {};
}

async function updateSettings(settings) {
  // Try update first
  const { data, error } = await supabase.from('settings').update({ config: settings }).eq('id', 1).select().single();
  if (!error) return data.config;
  // If update fails (e.g. no row), try insert
  const { data: newData, error: insertError } = await supabase.from('settings').insert([{ id: 1, config: settings }]).select().single();
  if (insertError) throw insertError;
  return newData.config;
}

// Deprecated mapping functions, removed for JSONB simplification
function mapSettingsFromDb(s) { return s; }
function mapSettingsToDb(s) { return s; }

// --- Users (custom 'users' table or auth.users wrapper)
// We'll use a custom 'users' table to match key-value structure of db.json for now
// Ideally this should migrate to Supabase Auth, but that requires frontend changes.
async function getUsers() {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function getUserByEmail(email) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error && error.code !== 'PGRST116') {
    // If error is "multiple rows", return first one?
    if (error.code === 'PGRST116') return null; // No rows
    throw error;
  }
  return data;
}

async function createUser(userData) {
  const { data, error } = await supabase.from('users').insert([{
    email: userData.email,
    password: userData.password, // Hashed password
    name: userData.name,
    phone: userData.phone,
    role: userData.role || 'customer'
  }]).select().single();
  if (error) throw error;
  return data;
}

async function updateUser(id, updates) {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
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
  updateOrderStatus,
  getRatingsByProduct,
  addRating,
  getSettings,
  updateSettings,
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser
};
