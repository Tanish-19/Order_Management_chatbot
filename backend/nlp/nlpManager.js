import { NlpManager } from 'node-nlp';

const manager = new NlpManager({ languages: ['en'], forceNER: true, nlu: { log: false } });

export const trainModel = async () => {
  // =============================================
  // GREETINGS
  // =============================================
  const greetings = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
    'howdy', 'hi there', 'hey there', 'hola', 'sup', 'whats up',
    'yo', 'greetings', 'hey bot', 'hi bot', 'hello there',
  ];
  greetings.forEach(g => manager.addDocument('en', g, 'greetings.hello'));

  // =============================================
  // SHOW MENU / BROWSE FOOD
  // =============================================
  const showMenu = [
    'show me the menu', 'what do you have', 'show menu', 'menu please',
    'what is on the menu', 'display menu', 'i want to see the menu',
    'can i see the menu', 'what food do you have', 'what items do you have',
    'show me food', 'what can i order', 'list all items', 'show all food',
    'show me what you got', 'menu', 'food menu', 'what is available',
    'show available items', 'what do you serve', 'show me your items',
  ];
  showMenu.forEach(s => manager.addDocument('en', s, 'menu.show'));

  // =============================================
  // SEARCH / ORDER SPECIFIC FOOD
  // =============================================
  const orderFood = [
    'i want to order %food%', 'i want %food%', 'get me %food%',
    'i would like %food%', 'can i get %food%', 'order %food%',
    'show me %food%', 'i need %food%', 'give me %food%',
    'do you have %food%', 'i am looking for %food%',
    'find me %food%', 'search for %food%', 'any %food% available',
    'i want to order a burger', 'i want burger', 'i want pizza',
    'get me a pizza', 'i want to order pizza', 'show me burgers',
    'show me pizzas', 'i want fries', 'get me fries',
    'can i get a burger', 'i need a pizza', 'give me a burger',
    'i want to eat burger', 'i want to eat pizza',
    'i feel like having burger', 'i feel like having pizza',
    'order burger', 'order pizza', 'order fries', 'order coke',
    'order drink', 'order sandwich', 'order wrap', 'order noodles',
    'order biryani', 'order pasta', 'order momos',
    'i want a sandwich', 'i want noodles', 'i want biryani',
    'i want pasta', 'i want momos', 'i want a wrap',
    'show me sandwiches', 'show me drinks', 'show me desserts',
    'i want something to eat', 'i want food',
    'i am hungry', 'i am starving', 'feed me',
    // Food-specific recommendations / suggestions (should search, not random recommend)
    'suggest me sandwich', 'suggest sandwich', 'suggest me a sandwich',
    'recommend sandwich', 'recommend me sandwich', 'what do you suggest in sandwich',
    'what would you suggest me in sandwich', 'what would you recommend in sandwich',
    'suggest me burger', 'suggest burger', 'recommend burger', 'recommend me burger',
    'what do you suggest in burger', 'what would you suggest in burger',
    'suggest me pizza', 'suggest pizza', 'recommend pizza', 'recommend me pizza',
    'what do you suggest in pizza', 'what would you recommend in pizza',
    'suggest me biryani', 'recommend biryani', 'suggest me pasta', 'recommend pasta',
    'suggest me momos', 'recommend momos', 'suggest me noodles', 'recommend noodles',
    'suggest me fries', 'recommend fries', 'suggest me dessert', 'recommend dessert',
    'suggest me drinks', 'recommend drinks', 'suggest me wraps', 'recommend wraps',
    'what do you have in sandwich', 'what do you have in burger', 'what do you have in pizza',
    'anything good in sandwich', 'anything good in burger', 'anything good in pizza',
    'best sandwich', 'best burger', 'best pizza', 'best biryani',
    'which sandwich is good', 'which burger is good', 'which pizza is good',
  ];
  orderFood.forEach(o => manager.addDocument('en', o, 'order.food'));

  // =============================================
  // ADD TO CART
  // =============================================
  const addToCart = [
    'add to cart', 'add it to cart', 'add this to my cart',
    'add %food% to cart', 'put it in cart', 'yes add it',
    'add that', 'add the first one', 'add the second one',
    'i will take it', 'i will have it', 'yes i want it',
    'add it', 'yes add to cart', 'put in cart',
    'cart me that', 'add to my order', 'add this to my order',
    'i want to add %food%', 'add %number% %food%',
    'add one', 'add two', 'add 1', 'add 2', 'add 3',
  ];
  addToCart.forEach(a => manager.addDocument('en', a, 'cart.add'));

  // =============================================
  // VIEW CART
  // =============================================
  const viewCart = [
    'show my cart', 'view cart', 'what is in my cart', 'cart',
    'show cart', 'open cart', 'my cart', 'whats in my cart',
    'display cart', 'see my cart', 'check my cart',
    'cart summary', 'show order summary',
  ];
  viewCart.forEach(v => manager.addDocument('en', v, 'cart.view'));

  // =============================================
  // REMOVE FROM CART
  // =============================================
  const removeFromCart = [
    'remove from cart', 'remove %food% from cart', 'delete from cart',
    'remove it', 'take it out', 'remove that item',
    'clear cart', 'empty cart', 'remove all items',
    'remove the first one', 'remove the last one',
  ];
  removeFromCart.forEach(r => manager.addDocument('en', r, 'cart.remove'));

  // =============================================
  // PLACE ORDER / CHECKOUT
  // =============================================
  const placeOrder = [
    'place my order', 'checkout', 'confirm order', 'place order',
    'i want to checkout', 'proceed to checkout', 'finalize order',
    'complete my order', 'submit order', 'order now', 'buy now',
    'i am done ordering', 'thats all', 'that is all',
    'done ordering', 'finish order',
  ];
  placeOrder.forEach(p => manager.addDocument('en', p, 'order.place'));

  // =============================================
  // TRACK ORDER
  // =============================================
  const trackOrder = [
    'where is my order', 'track my order', 'order status',
    'when will my food arrive', 'how long for delivery',
    'is my order on the way', 'track order', 'order tracking',
    'where is my food', 'when will i get my food',
    'delivery status', 'check my order status',
    'what is the status of my order', 'eta for my order',
  ];
  trackOrder.forEach(t => manager.addDocument('en', t, 'order.track'));

  // =============================================
  // CANCEL ORDER
  // =============================================
  const cancelOrder = [
    'cancel my order', 'i want to cancel', 'cancel order',
    'please cancel my order', 'stop my order',
  ];
  cancelOrder.forEach(c => manager.addDocument('en', c, 'order.cancel'));

  // =============================================
  // FAQ - DELIVERY
  // =============================================
  const faqDelivery = [
    'what are the delivery timings', 'how long does delivery take',
    'delivery time', 'when do you deliver', 'delivery hours',
    'how fast is delivery', 'delivery charges', 'is delivery free',
    'minimum order for delivery', 'delivery area',
  ];
  faqDelivery.forEach(f => manager.addDocument('en', f, 'faq.delivery'));

  // =============================================
  // FAQ - REFUND
  // =============================================
  const faqRefund = [
    'refund policy', 'how can i get a refund', 'i want a refund',
    'refund my order', 'money back', 'return policy',
    'can i get my money back',
  ];
  faqRefund.forEach(f => manager.addDocument('en', f, 'faq.refund'));

  // =============================================
  // FAQ - PAYMENT
  // =============================================
  const faqPayment = [
    'what payment methods do you accept', 'payment options',
    'can i pay with card', 'do you accept upi', 'cash on delivery',
    'online payment', 'how to pay',
  ];
  faqPayment.forEach(f => manager.addDocument('en', f, 'faq.payment'));

  // =============================================
  // RECOMMENDATION
  // =============================================
  const recommend = [
    'suggest something', 'recommend something', 'what should i order',
    'suggest something spicy', 'recommend fast food',
    'what is popular', 'what is trending', 'best sellers',
    'most ordered', 'top items', 'popular items',
    'what do you recommend', 'surprise me', 'chef special',
    'suggest me food', 'recommend me something good',
  ];
  recommend.forEach(r => manager.addDocument('en', r, 'recommend'));

  // =============================================
  // THANKS
  // =============================================
  const thanks = [
    'thank you', 'thanks', 'thanks a lot', 'thank you so much',
    'appreciate it', 'thanks bot', 'great thanks', 'cheers',
  ];
  thanks.forEach(t => manager.addDocument('en', t, 'thanks'));

  // =============================================
  // GOODBYE
  // =============================================
  const goodbye = [
    'bye', 'goodbye', 'see you', 'later', 'see you later',
    'bye bye', 'good night', 'take care', 'cya',
  ];
  goodbye.forEach(g => manager.addDocument('en', g, 'goodbye'));

  // =============================================
  // NEGATIVE SENTIMENT
  // =============================================
  const angry = [
    'this is terrible', 'i hate this service', 'worst service ever',
    'this is bad', 'very disappointed', 'not happy', 'worst experience',
    'pathetic service', 'useless', 'waste of time',
  ];
  angry.forEach(a => manager.addDocument('en', a, 'sentiment.angry'));

  // =============================================
  // HELP
  // =============================================
  const help = [
    'help', 'help me', 'what can you do', 'how does this work',
    'i need help', 'assist me', 'what are your capabilities',
    'features', 'what can i ask',
  ];
  help.forEach(h => manager.addDocument('en', h, 'help'));

  // =============================================
  // ANSWERS (fallback text - our handler will override most of these)
  // =============================================
  manager.addAnswer('en', 'greetings.hello', 'Hello! 👋 Welcome to FoodieBot! I can help you browse our menu, place orders, and track deliveries. What would you like to do?');
  manager.addAnswer('en', 'menu.show', 'Let me show you our menu!');
  manager.addAnswer('en', 'order.food', 'Let me find that for you!');
  manager.addAnswer('en', 'cart.add', 'Adding to your cart!');
  manager.addAnswer('en', 'cart.view', 'Here is your cart!');
  manager.addAnswer('en', 'cart.remove', 'Removing from your cart.');
  manager.addAnswer('en', 'order.place', 'Let me place your order!');
  manager.addAnswer('en', 'order.track', 'Let me check your order status.');
  manager.addAnswer('en', 'order.cancel', 'I can help you cancel your order.');
  manager.addAnswer('en', 'faq.delivery', '🚗 We deliver from 9 AM to 11 PM. Delivery usually takes 30-45 minutes. Delivery is free on orders above ₹299!');
  manager.addAnswer('en', 'faq.refund', '💰 Refunds are processed within 3-5 business days for cancelled orders. Contact support for any issues.');
  manager.addAnswer('en', 'faq.payment', '💳 We accept Cash on Delivery, UPI, Credit/Debit Cards, and Net Banking.');
  manager.addAnswer('en', 'recommend', 'Let me recommend some popular items for you!');
  manager.addAnswer('en', 'thanks', 'You\'re welcome! 😊 Is there anything else I can help you with?');
  manager.addAnswer('en', 'goodbye', 'Goodbye! 👋 Thank you for ordering with FoodieBot. Have a great meal!');
  manager.addAnswer('en', 'sentiment.angry', 'I\'m really sorry to hear that you\'re frustrated 😔. Let me try to fix this for you. Can you tell me what went wrong?');
  manager.addAnswer('en', 'help', '🤖 I can help you with:\n• Browse the menu\n• Search for specific food\n• Add items to cart\n• Place orders\n• Track your order\n• Answer FAQs\nJust type what you need!');

  // Named Entity Recognition for food items
  manager.addNamedEntityText('food', 'burger', ['en'], ['burger', 'burgers', 'hamburger', 'veg burger', 'chicken burger']);
  manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza', 'pizzas', 'cheese pizza', 'margherita', 'pepperoni pizza']);
  manager.addNamedEntityText('food', 'fries', ['en'], ['fries', 'french fries', 'crispy fries']);
  manager.addNamedEntityText('food', 'coke', ['en'], ['coke', 'coca cola', 'cold drink', 'soft drink', 'drink', 'drinks', 'beverage']);
  manager.addNamedEntityText('food', 'sandwich', ['en'], ['sandwich', 'sandwiches', 'club sandwich', 'grilled sandwich']);
  manager.addNamedEntityText('food', 'biryani', ['en'], ['biryani', 'biriyani', 'dum biryani', 'chicken biryani', 'veg biryani']);
  manager.addNamedEntityText('food', 'pasta', ['en'], ['pasta', 'penne', 'spaghetti', 'macaroni']);
  manager.addNamedEntityText('food', 'noodles', ['en'], ['noodles', 'chow mein', 'hakka noodles']);
  manager.addNamedEntityText('food', 'momos', ['en'], ['momos', 'momo', 'dumplings', 'dim sum']);
  manager.addNamedEntityText('food', 'wrap', ['en'], ['wrap', 'wraps', 'chicken wrap', 'paneer wrap']);
  manager.addNamedEntityText('food', 'dessert', ['en'], ['dessert', 'desserts', 'ice cream', 'cake', 'brownie', 'pastry', 'sweet']);

  await manager.train();
  console.log('✅ NLP Model trained with comprehensive dataset.');
};

export const processMessage = async (message, context = {}) => {
  const response = await manager.process('en', message, context);
  return response;
};
