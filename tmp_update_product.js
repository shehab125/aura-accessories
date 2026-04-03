
const { supabase } = require('./supabaseClient');

async function enableCustomization() {
  const { data, error } = await supabase
    .from('products')
    .update({
      has_customization: true,
      customization_type: 'names',
      customization_limit: 15,
      custom_questions: ['What name would you like?', 'Any special instructions?']
    })
    .eq('id', '194e23b9-4a3d-4865-bd71-e44d0d4af181') // Using the ID from the user's previous message or just any existing ID
    .select();

  if (error) {
    console.error('Error updating product:', error);
  } else {
    console.log('Product updated successfully:', data);
  }
}

enableCustomization();
