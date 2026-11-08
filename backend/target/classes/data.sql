INSERT IGNORE INTO categories (id, category_name, description) VALUES
(1, 'Breakfast', 'Fresh breakfast items to start your day'),
(2, 'Starters', 'Delicious appetizers and finger foods'),
(3, 'Main Course', 'Hearty and satisfying main dishes'),
(4, 'Biriyani', 'Authentic fragrant and spiced biriyanis'),
(5, 'Burgers', 'Juicy handcrafted gourmet burgers'),
(6, 'Pizza', 'Freshly baked stone-oven pizzas'),
(7, 'Beverages', 'Refreshing cold and hot beverages'),
(8, 'Desserts', 'Sweet treats and desserts');

INSERT IGNORE INTO food_items (id, food_name, description, price, image_url, category_id, available) VALUES
(1, 'Classic Masala Dosa', 'Crispy golden crepe filled with spiced potato masala, served with coconut chutney and piping hot sambar.', 120.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', 1, 1),
(2, 'Fluffy Idli & Vada Combo', 'Steamed fluffy rice cakes paired with crispy medu vada, spicy gunpowder podi, and fresh ground chutneys.', 90.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 1, 1),
(3, 'Crispy Paneer 65', 'Tender cottage cheese cubes tossed in spicy South Indian curry leaves, crushed pepper, and roasted chili garlic masala.', 210.00, 'https://images.pexels.com/photos/29631468/pexels-photo-29631468/free-photo-of-spicy-indo-chinese-chili-paneer-on-plate.jpeg?auto=compress&cs=tinysrgb&w=600', 2, 1),
(4, 'Chicken Tikka Kebab', 'Succulent boneless chicken chunks marinated in mustard oil, roasted cumin, and hung yogurt, char-grilled over hot coals.', 260.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', 2, 1),
(5, 'Royal Hyderabadi Dum Biriyani', 'Long-grain aged basmati rice slow cooked on dum with tender spiced chicken, saffron, browned onions, and boiled egg.', 320.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 4, 1),
(6, 'Fragrant Mutton Biriyani', 'Tender slow-cooked goat meat infused with hand-pounded spices, mint, coriander, and served with rich mirchi ka salan.', 390.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80', 4, 1),
(7, 'Butter Chicken with Garlic Naan', 'Silky, buttery tomato gravy with tandoori grilled chicken morsels, finished with fresh cream and accompanied by garlic naan.', 310.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', 3, 1),
(8, 'Paneer Butter Masala', 'Melt-in-mouth cottage cheese cubes simmered in an aromatic cashew-tomato velouté with fenugreek and butter.', 250.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', 3, 1),
(9, 'MAD Smash Bacon Cheese Burger', 'Double crispy smashed beef/chicken patty, melted sharp cheddar, caramelized onions, smoked bacon, and house secret sauce.', 240.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 5, 1),
(10, 'Crispy Zinger Chicken Burger', 'Golden fried crunchy chicken breast fillet, spicy chipotle mayo, and shredded iceberg lettuce inside toasted brioche.', 199.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', 5, 1),
(11, 'Artisan Margherita Pizza', 'Authentic 48-hour fermented sourdough crust, San Marzano tomato reduction, buffalo mozzarella, and fresh sweet basil.', 340.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80', 6, 1),
(12, 'Spicy Pepperoni & Jalapeno Pizza', 'Loaded with smoky pepperoni slices, hot pickled jalapenos, chili-infused honey drizzle, and double artisan cheese.', 420.00, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80', 6, 1),
(13, 'Mango Alphonso Shake', 'Ultra-thick gourmet shake made from 100% natural Ratnagiri Alphonso mango pulp, condensed cream, and vanilla bean scoop.', 130.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80', 7, 1),
(14, 'Iced Caramel Macchiato', 'Double shot of fresh Arabica espresso over iced whole milk, French vanilla syrup, and rich salted caramel swirls.', 160.00, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80', 7, 1),
(15, 'Sizzling Brownie with Ice Cream', 'Dense dark Belgian chocolate brownie served on a sizzling hot iron platter with Madagascar vanilla gelato and hot fudge.', 180.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 8, 1),
(16, 'Royal Gulab Jamun (2 Pcs)', 'Golden fried khoya dumplings steeped in warm saffron and green cardamom infused sugar nectar, crowned with slivered pistachios.', 99.00, 'https://plus.unsplash.com/premium_photo-1669150852127-2435412047f2?auto=format&fit=crop&w=600&q=80', 8, 1);
