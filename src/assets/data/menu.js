export const MENU = [
  // --- EXISTING ITEMS ---
  { id: 'chicken-burger', name: 'Chicken Burger', price: 180, category: 'Burgers', brand: 'Food', destination: 'kitchen' },
  { id: 'veg-pizza', name: 'Veg Pizza', price: 250, category: 'Pizza', brand: 'Food', destination: 'kitchen' },
  { id: 'onion-rings', name: 'Onion Rings', price: 120, category: 'Snacks', brand: 'Food', destination: 'kitchen' },
  { id: 'fresh-salad', name: 'Fresh Salad', price: 140, category: 'Salads', brand: 'Food', destination: 'kitchen' },
  { id: 'french-fries', name: 'French Fries', price: 110, category: 'Snacks', brand: 'Food', destination: 'kitchen' },
  { id: 'fish-chips', name: 'Fish & Chips', price: 260, category: 'Seafood', brand: 'Food', destination: 'kitchen' },
  { id: 'grilled-burger', name: 'Grilled Burger', price: 200, category: 'Burgers', brand: 'Food', destination: 'kitchen' },
  { id: 'tomato-soup', name: 'Tomato Soup', price: 90, category: 'Soup', brand: 'Food', destination: 'kitchen' },

  // --- NEW INDIAN MAINS ---
  { id: 'butter-chicken', name: 'Butter Chicken', price: 320, category: 'Main Course', brand: 'Food', destination: 'kitchen' },
  { id: 'paneer-tikka', name: 'Paneer Tikka', price: 280, category: 'Starters', brand: 'Food', destination: 'kitchen' },
  { id: 'dal-makhani', name: 'Dal Makhani', price: 240, category: 'Main Course', brand: 'Food', destination: 'kitchen' },
  { id: 'garlic-naan', name: 'Garlic Naan', price: 60, category: 'Breads', brand: 'Food', destination: 'kitchen' },
  { id: 'mutton-rogan-josh', name: 'Mutton Rogan Josh', price: 450, category: 'Main Course', brand: 'Food', destination: 'kitchen' },
  { id: 'tandoori-chicken', name: 'Tandoori Chicken', price: 350, category: 'Starters', brand: 'Food', destination: 'kitchen' },
  { id: 'chole-bhature', name: 'Chole Bhature', price: 180, category: 'Indian', brand: 'Food', destination: 'kitchen' },
  { id: 'pav-bhaji', name: 'Pav Bhaji', price: 150, category: 'Street Food', brand: 'Food', destination: 'kitchen' },

  // --- RICE & NOODLES ---
  { id: 'veg-biryani', name: 'Veg Biryani', price: 220, category: 'Rice', brand: 'Food', destination: 'kitchen' },
  { id: 'chicken-biryani', name: 'Chicken Biryani', price: 280, category: 'Rice', brand: 'Food', destination: 'kitchen' },
  { id: 'hakka-noodles', name: 'Hakka Noodles', price: 190, category: 'Chinese', brand: 'Food', destination: 'kitchen' },
  { id: 'manchurian', name: 'Veg Manchurian', price: 200, category: 'Chinese', brand: 'Food', destination: 'kitchen' },
  { id: 'spring-rolls', name: 'Spring Rolls', price: 160, category: 'Chinese', brand: 'Food', destination: 'kitchen' },

  // --- PASTA & SANDWICHES ---
  { id: 'pasta-alfredo', name: 'Pasta Alfredo', price: 290, category: 'Pasta', brand: 'Food', destination: 'kitchen' },
  { id: 'pasta-arrabiata', name: 'Pasta Arrabiata', price: 270, category: 'Pasta', brand: 'Food', destination: 'kitchen' },
  { id: 'club-sandwich', name: 'Club Sandwich', price: 210, category: 'Sandwich', brand: 'Food', destination: 'kitchen' },

  // --- BAKERY & COUNTER ITEMS (No KOT) ---
  { id: 'donut', name: 'Chocolate Donut', price: 80, category: 'Bakery', brand: 'Food', destination: 'counter' },
  { id: 'croissant', name: 'Butter Croissant', price: 90, category: 'Bakery', brand: 'Food', destination: 'counter' },
  { id: 'cupcake', name: 'Vanilla Cupcake', price: 60, category: 'Bakery', brand: 'Food', destination: 'counter' },
  { id: 'bagel', name: 'Cream Cheese Bagel', price: 110, category: 'Bakery', brand: 'Food', destination: 'counter' },

  // --- DESSERTS ---
  { id: 'chocolate-brownie', name: 'Sizzling Brownie', price: 180, category: 'Desserts', brand: 'Food', destination: 'kitchen' },
  { id: 'ice-cream-sundae', name: 'Ice Cream Sundae', price: 150, category: 'Desserts', brand: 'Food', destination: 'counter' },
  { id: 'gulab-jamun', name: 'Gulab Jamun', price: 80, category: 'Desserts', brand: 'Food', destination: 'counter' },
  { id: 'rasmalai', name: 'Rasmalai', price: 100, category: 'Desserts', brand: 'Food', destination: 'counter' },

  // --- DRINKS (EXISTING + NEW) ---
  { id: 'iced-coffee', name: 'Iced Coffee', price: 120, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'masala-chai', name: 'Masala Chai', price: 70, category: 'Drinks', brand: 'Drinks', destination: 'kitchen' },
  { id: 'fresh-lime-soda', name: 'Fresh Lime Soda', price: 90, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'mango-lassi', name: 'Mango Lassi', price: 110, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'lassi-sweet', name: 'Sweet Lassi', price: 100, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'orange-juice', name: 'Orange Juice', price: 100, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'coke-can', name: 'Coke Can', price: 60, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'lemon-iced-tea', name: 'Lemon Iced Tea', price: 95, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'water-bottle', name: 'Water Bottle', price: 30, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'mojito', name: 'Virgin Mojito', price: 140, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'milkshake-chocolate', name: 'Chocolate Shake', price: 160, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'milkshake-strawberry', name: 'Strawberry Shake', price: 160, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'cold-coffee', name: 'Cold Coffee', price: 130, category: 'Drinks', brand: 'Drinks', destination: 'counter' },
  { id: 'green-tea', name: 'Green Tea', price: 60, category: 'Drinks', brand: 'Drinks', destination: 'kitchen' }
]
