// Supabase client initialization
// This file sets up a Supabase client using the publishable API key
// provided by the user. You can import functions from this module
// anywhere in your project to interact with the Supabase database.

// NOTE: The publishable key is safe to use on the client when row level
// security is enabled for your tables. Never expose the secret key
// directly in client-side code. The secret key should be stored
// securely on your server or in environment variables.

// Include the Supabase JS library via CDN if it isn't already loaded.
// This import statement uses the jsDelivr CDN to load the ES module version
// of the library. If you bundle your assets, you can install
// @supabase/supabase-js via npm and import it instead.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Project configuration (replace with your own values as needed)
const SUPABASE_URL = 'https://phwwrcihcerxsllnyzyd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tWyHH6MkjOORG5JEmgsmsw_tIso5rya';

// Initialize the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetch a list of products from the database. This returns an array
 * of product objects with all columns from the `products` table.
 *
 * @returns {Promise<Array>} Array of products
 */
export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products', error);
    throw error;
  }
  return data || [];
}

/**
 * Create a new product in the database. The `product` object should
 * contain the fields defined in your Supabase `products` table (e.g.,
 * name, name_ar, category, gender, material, price, etc.).
 *
 * @param {Object} product The product data to insert
 * @returns {Promise<Object>} The newly created product record
 */
export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert([product]).single();
  if (error) {
    console.error('Error creating product', error);
    throw error;
  }
  return data;
}

/**
 * Update an existing product in the database. The `productId` should
 * match the ID of the record you wish to update, and the `updates`
 * object should contain the fields you want to modify.
 *
 * @param {String|Number} productId The primary key of the product
 * @param {Object} updates The fields to update
 * @returns {Promise<Object>} The updated product record
 */
export async function updateProduct(productId, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .single();
  if (error) {
    console.error('Error updating product', error);
    throw error;
  }
  return data;
}

/**
 * Delete a product from the database by ID. Use with caution.
 *
 * @param {String|Number} productId The primary key of the product to delete
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) {
    console.error('Error deleting product', error);
    throw error;
  }
}

/**
 * Fetch all blog posts from the `blog_posts` table.
 *
 * @returns {Promise<Array>} Array of blog posts
 */
export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) {
    console.error('Error fetching blog posts', error);
    throw error;
  }
  return data || [];
}

/**
 * Create a new blog post in the database.
 *
 * @param {Object} post The blog post data
 * @returns {Promise<Object>} The inserted blog post
 */
export async function createBlogPost(post) {
  const { data, error } = await supabase.from('blog_posts').insert([post]).single();
  if (error) {
    console.error('Error creating blog post', error);
    throw error;
  }
  return data;
}

/**
 * Submit a new order to the `orders` and `order_items` tables. This helper
 * automatically splits the cart items into separate rows in `order_items`.
 *
 * @param {Object} orderData Object containing shipping details and user_id
 * @param {Array} cartItems Array of objects with product_id and quantity
 */
export async function submitOrder(orderData, cartItems) {
  // start a transaction by inserting into orders and then order_items
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .single();
  if (orderError) {
    console.error('Error creating order', orderError);
    throw orderError;
  }
  // prepare items
  const items = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.id,
    qty: item.qty,
    price: item.price,
  }));
  const { error: itemsError } = await supabase.from('order_items').insert(items);
  if (itemsError) {
    console.error('Error inserting order items', itemsError);
    throw itemsError;
  }
  return order;
}

/**
 * Update the status of an existing order.
 *
 * @param {String|Number} orderId The ID of the order to update
 * @param {String} status One of 'pending','processing','shipped','delivered','cancelled'
 */
export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) {
    console.error('Error updating order status', error);
    throw error;
  }
}

/**
 * Change a user's role (e.g., to admin). This requires a service key or
 * administrative privileges. It updates the `profiles.role` column.
 *
 * @param {String} userId The user's UUID
 * @param {String} role The new role ('customer' or 'admin')
 */
export async function changeUserRole(userId, role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) {
    console.error('Error changing user role', error);
    throw error;
  }
}

/**
 * Add a rating for a product. Requires that the user has purchased and
 * received the product (enforced via RLS). The rating object should include
 * product_id, user_id, stars, comment.
 *
 * @param {Object} rating The rating to insert
 */
export async function addRating(rating) {
  const { data, error } = await supabase.from('ratings').insert([rating]).single();
  if (error) {
    console.error('Error adding rating', error);
    throw error;
  }
  return data;
}

/**
 * Fetch ratings for a specific product.
 *
 * @param {String|Number} productId The product ID
 * @returns {Promise<Array>} Array of rating objects
 */
export async function fetchRatings(productId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching ratings', error);
    throw error;
  }
  return data || [];
}

/**
 * Award ORA points to a user when an order is delivered. This should be
 * called after updating an order's status to 'delivered'. The points
 * awarded are calculated as floor(total / 10). If the user has existing
 * points, they will be incremented by the calculated amount.
 *
 * @param {String|Number} orderId The ID of the delivered order
 */
export async function awardOraPoints(orderId) {
  // Fetch order and associated user
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, total, user_id')
    .eq('id', orderId)
    .single();
  if (orderErr || !order) {
    console.error('Error fetching order for ORA points', orderErr);
    throw orderErr;
  }
  const points = Math.floor((order.total || 0) / 10);
  // Update user points
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('ora_points')
    .eq('id', order.user_id)
    .single();
  if (profErr || !profile) {
    console.error('Error fetching user profile for ORA points', profErr);
    throw profErr;
  }
  const newTotal = (profile.ora_points || 0) + points;
  const { error: updErr } = await supabase
    .from('profiles')
    .update({ ora_points: newTotal })
    .eq('id', order.user_id);
  if (updErr) {
    console.error('Error updating ORA points', updErr);
    throw updErr;
  }
  return newTotal;
}