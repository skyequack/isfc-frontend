import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the menu.json file
const menuPath = path.join(__dirname, '..', 'menu.json');
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

// Helper function to generate appropriate data based on item name
function generateItemData(itemName, category) {
  const name = itemName.toLowerCase();
  
  // Default values
  let rating = "90%";
  let description = `Delicious ${itemName}`;
  let prepTime = "15 minutes";
  let ingredients = [];
  let allergens = [];
  let dietary = [];
  
  // Category-based defaults
  if (category.includes('BREAKFAST')) {
    prepTime = "10 minutes";
    rating = "88%";
  } else if (category.includes('STATION') || category.includes('LIVE')) {
    prepTime = "20 minutes";
    rating = "92%";
  } else if (category.includes('DESSERT')) {
    prepTime = "5 minutes";
    rating = "95%";
  }
  
  // Coffee & Tea
  if (name.includes('coffee') || name.includes('tea')) {
    description = "Premium coffee and tea station with various options";
    prepTime = "5 minutes";
    ingredients = ["coffee beans", "tea leaves", "milk", "sugar"];
    allergens = ["dairy"];
    dietary = ["vegetarian"];
    rating = "94%";
  }
  // Drinks
  else if (name.includes('drink') || name.includes('juice')) {
    description = "Refreshing beverages including hot and cold options";
    prepTime = "5 minutes";
    ingredients = ["water", "fruit juices", "tea", "coffee"];
    allergens = [];
    dietary = ["vegetarian", "vegan"];
    rating = "90%";
  }
  // Lamb dishes
  else if (name.includes('lamb') || name.includes('خروف')) {
    description = "Tender lamb prepared with traditional Saudi spices and herbs";
    prepTime = "180 minutes";
    ingredients = ["lamb", "rice", "spices", "herbs"];
    allergens = [];
    dietary = [];
    rating = "96%";
  }
  // Camel
  else if (name.includes('camel')) {
    description = "Authentic roasted camel prepared with traditional methods";
    prepTime = "240 minutes";
    ingredients = ["camel meat", "rice", "spices", "herbs"];
    allergens = [];
    dietary = [];
    rating = "95%";
  }
  // Fish/Seafood
  else if (name.includes('fish') || name.includes('hamour') || name.includes('shrimp') || name.includes('seafood')) {
    description = "Fresh seafood grilled to perfection with aromatic spices";
    prepTime = "30 minutes";
    ingredients = ["fish", "lemon", "herbs", "spices"];
    allergens = ["fish", "shellfish"];
    dietary = [];
    rating = "93%";
  }
  // Chicken
  else if (name.includes('chicken')) {
    description = "Succulent chicken prepared with special seasoning";
    prepTime = "45 minutes";
    ingredients = ["chicken", "spices", "herbs", "olive oil"];
    allergens = [];
    dietary = [];
    rating = "91%";
  }
  // Rice dishes
  else if (name.includes('rice') || name.includes('biryani') || name.includes('kabsa')) {
    description = "Aromatic rice dish cooked with fragrant spices";
    prepTime = "40 minutes";
    ingredients = ["basmati rice", "spices", "herbs", "ghee"];
    allergens = ["dairy"];
    dietary = ["vegetarian"];
    rating = "92%";
  }
  // Salad
  else if (name.includes('salad')) {
    description = "Fresh garden salad with seasonal vegetables";
    prepTime = "10 minutes";
    ingredients = ["lettuce", "tomatoes", "cucumbers", "dressing"];
    allergens = [];
    dietary = ["vegetarian", "vegan"];
    rating = "89%";
  }
  // Bread
  else if (name.includes('bread') || name.includes('خبز')) {
    description = "Freshly baked bread served warm";
    prepTime = "20 minutes";
    ingredients = ["flour", "water", "yeast", "salt"];
    allergens = ["gluten"];
    dietary = ["vegetarian"];
    rating = "90%";
  }
  // Desserts
  else if (name.includes('dessert') || name.includes('cake') || name.includes('sweet')) {
    description = "Delightful sweet treat to end your meal";
    prepTime = "15 minutes";
    ingredients = ["flour", "sugar", "eggs", "butter"];
    allergens = ["gluten", "dairy", "eggs"];
    dietary = ["vegetarian"];
    rating = "94%";
  }
  // Breakfast items
  else if (name.includes('breakfast') || name.includes('فطور')) {
    description = "Hearty breakfast selection with traditional and international options";
    prepTime = "15 minutes";
    ingredients = ["eggs", "bread", "cheese", "vegetables"];
    allergens = ["gluten", "dairy", "eggs"];
    dietary = ["vegetarian"];
    rating = "88%";
  }
  // Lunch/Dinner
  else if (name.includes('lunch') || name.includes('dinner') || name.includes('غداء') || name.includes('عشاء')) {
    description = "Complete meal with main course, sides, and accompaniments";
    prepTime = "30 minutes";
    ingredients = ["protein", "rice", "vegetables", "sauce"];
    allergens = [];
    dietary = [];
    rating = "91%";
  }
  // Snacks/Refreshments
  else if (name.includes('snack') || name.includes('refreshment') || name.includes('سناك')) {
    description = "Light bites and refreshing beverages";
    prepTime = "10 minutes";
    ingredients = ["assorted snacks", "fruits", "beverages"];
    allergens = [];
    dietary = ["vegetarian"];
    rating = "87%";
  }
  
  return {
    rating,
    description,
    prepTime,
    ingredients,
    allergens,
    dietary
  };
}

// Update each item in the menu
menu.categories.forEach(category => {
  category.items.forEach(item => {
    const generatedData = generateItemData(item.name_en, category.category);
    
    // Add new fields to the item
    item.rating = generatedData.rating;
    item.description = generatedData.description;
    item.prepTime = generatedData.prepTime;
    item.ingredients = generatedData.ingredients;
    item.allergens = generatedData.allergens;
    item.dietary = generatedData.dietary;
  });
});

// Write the updated menu back to the file
fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2), 'utf8');
console.log('✅ Menu updated successfully!');
console.log(`📝 Updated ${menu.categories.reduce((sum, cat) => sum + cat.items.length, 0)} items`);
