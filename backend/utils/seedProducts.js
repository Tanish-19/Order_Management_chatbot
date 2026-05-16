import Product from '../models/product.model.js';

/**
 * Seed the database with initial food products.
 * Only seeds if no products exist.
 */
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`📦 ${count} products already in DB. Skipping seed.`);
    return;
  }

  const products = [
    // Burgers
    { name: 'Classic Veg Burger', description: 'Crispy veg patty with lettuce, tomato, and special sauce', price: 129, category: 'burger', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400' },
    { name: 'Chicken Burger', description: 'Juicy grilled chicken patty with cheese and mayo', price: 179, category: 'burger', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { name: 'Double Cheese Burger', description: 'Two beef patties with double cheddar cheese', price: 229, category: 'burger', imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
    { name: 'Spicy Paneer Burger', description: 'Paneer tikka patty with jalapeños and spicy sauce', price: 159, category: 'burger', imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },

    // Pizza
    { name: 'Margherita Pizza', description: 'Classic cheese pizza with fresh basil and tomato sauce', price: 199, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
    { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni slices and mozzarella', price: 299, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
    { name: 'Paneer Tikka Pizza', description: 'Indian-style paneer tikka with onions and capsicum', price: 279, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
    { name: 'Farmhouse Pizza', description: 'Loaded with fresh vegetables and herbs', price: 249, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },

    // Biryani
    { name: 'Chicken Dum Biryani', description: 'Aromatic basmati rice cooked with tender chicken pieces', price: 249, category: 'biryani', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
    { name: 'Veg Biryani', description: 'Fragrant basmati rice with mixed vegetables and spices', price: 199, category: 'biryani', imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400' },
    { name: 'Hyderabadi Biryani', description: 'Authentic Hyderabadi-style biryani with rich flavors', price: 299, category: 'biryani', imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400' },

    // Pasta
    { name: 'Creamy Alfredo Pasta', description: 'Penne pasta in rich creamy white sauce', price: 219, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
    { name: 'Arrabbiata Pasta', description: 'Spicy tomato-based pasta with garlic and chili', price: 199, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400' },

    // Momos
    { name: 'Steamed Veg Momos', description: 'Soft steamed dumplings filled with mixed veggies', price: 99, category: 'momos', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400' },
    { name: 'Fried Chicken Momos', description: 'Crispy fried momos with spicy chicken filling', price: 129, category: 'momos', imageUrl: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=400' },

    // Fries & Sides
    { name: 'Classic French Fries', description: 'Golden crispy french fries with ketchup', price: 99, category: 'fries', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
    { name: 'Peri Peri Fries', description: 'Spicy peri peri seasoned fries', price: 129, category: 'fries', imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20aeb56983?w=400' },

    // Sandwiches
    { name: 'Club Sandwich', description: 'Triple-layer sandwich with chicken, egg, and veggies', price: 179, category: 'sandwich', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
    { name: 'Grilled Paneer Sandwich', description: 'Grilled sandwich with spiced paneer filling', price: 149, category: 'sandwich', imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400' },

    // Wraps
    { name: 'Chicken Shawarma Wrap', description: 'Juicy chicken shawarma in a soft tortilla wrap', price: 169, category: 'wrap', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
    { name: 'Paneer Tikka Wrap', description: 'Smoky paneer tikka wrapped with mint chutney', price: 149, category: 'wrap', imageUrl: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=400' },

    // Noodles
    { name: 'Hakka Noodles', description: 'Stir-fried hakka noodles with vegetables', price: 149, category: 'noodles', imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400' },
    { name: 'Schezwan Noodles', description: 'Spicy schezwan-style noodles with veggies', price: 159, category: 'noodles', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },

    // Drinks
    { name: 'Coca Cola', description: 'Chilled 300ml Coca Cola', price: 49, category: 'drink', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
    { name: 'Mango Lassi', description: 'Refreshing mango yogurt drink', price: 79, category: 'drink', imageUrl: 'https://images.unsplash.com/photo-1587015566802-7a0ee9c05c67?w=400' },
    { name: 'Cold Coffee', description: 'Iced coffee with cream and chocolate', price: 99, category: 'drink', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },

    // Desserts
    { name: 'Chocolate Brownie', description: 'Rich chocolate brownie with vanilla ice cream', price: 149, category: 'dessert', imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400' },
    { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in sugar syrup', price: 79, category: 'dessert', imageUrl: 'https://images.unsplash.com/photo-1666190077619-0cae500228be?w=400' },
  ];

  await Product.insertMany(products);
  console.log('🌱 Database seeded with food products!');
};

export default seedProducts;
