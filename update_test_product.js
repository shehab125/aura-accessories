
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Fetching first product...');
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);

  if (fetchError || !products.length) {
    console.error('Error fetching products:', fetchError);
    return;
  }

  const productId = products[0].id;
  console.log(`Updating product: ${products[0].name} (${productId})`);

  const { data, error } = await supabase
    .from('products')
    .update({
      has_customization: true,
      customization_type: 'names',
      customization_limit: 15,
      custom_questions: ['What name would you like?', 'Any special instructions?']
    })
    .eq('id', productId)
    .select();

  if (error) {
    console.error('Error updating product:', error);
  } else {
    console.log('Product updated successfully:', data);
    console.log(`\nNow you can test it at: http://localhost:3000/product.html?id=${productId}`);
  }
}

run();
