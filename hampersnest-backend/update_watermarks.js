import { Product } from './database/models.js';

async function updateWatermarkSettings() {
  try {
    const products = await Product.findAll();
    let updatedCount = 0;

    for (const product of products) {
      let settings = product.watermarkSettings;
      
      if (!settings) {
        settings = {
          enabled: true,
          type: 'Brand Name',
          text: 'Hampers Nest',
          position: 'Top Left',
          opacity: 18,
          size: 'Medium'
        };
      } else {
        settings.position = 'Top Left';
      }

      product.watermarkSettings = settings;
      product.changed('watermarkSettings', true);
      await product.save();
      updatedCount++;
    }

    console.log(`Successfully updated watermark settings to 'Top Left' for ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
}

updateWatermarkSettings();
