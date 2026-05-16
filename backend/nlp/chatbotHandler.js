import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import ChatMessage from '../models/chatMessage.model.js';
import { processMessage } from '../nlp/nlpManager.js';
import { contextManager } from './contextManager.js';

/**
 * ChatbotHandler: The brain of the chatbot.
 * Takes NLP-processed data + context and returns a rich response
 * that the frontend can render (text, product cards, cart info, etc.)
 */
class ChatbotHandler {

  /**
   * Main entry point: process a user message and return a structured response.
   */
  async handleMessage(text, sessionId, userId = null) {
    // Step 1: NLP Processing
    const nlpResult = await processMessage(text);
    const intent = nlpResult.intent || 'None';
    const score = nlpResult.score || 0;
    const entities = nlpResult.entities || [];
    const context = contextManager.getContext(sessionId);

    // Step 2: Extract food entity from NLP entities or from the raw text
    let foodEntity = null;
    const foodEnt = entities.find(e => e.entity === 'food');
    if (foodEnt) {
      foodEntity = foodEnt.option || foodEnt.utteranceText;
    }

    // Step 3: Check if we are in a multi-turn conversation state
    if (context.state !== 'IDLE') {
      return this.handleContextState(context, text, sessionId, userId, nlpResult);
    }

    // Step 4: Route to the correct handler based on intent
    // Use a confidence threshold; below it, try fallback
    if (score < 0.5 && intent !== 'None') {
      // Low confidence — still try to handle but with fallback ready
    }

    switch (intent) {
      case 'greetings.hello':
        return this.buildResponse(nlpResult.answer, 'text', intent, score);

      case 'menu.show':
        return this.handleShowMenu(sessionId);

      case 'order.food':
        return this.handleSearchFood(text, foodEntity, sessionId);

      case 'cart.add':
        return this.handleAddToCart(text, foodEntity, sessionId, context);

      case 'cart.view':
        return this.handleViewCart(sessionId);

      case 'cart.remove':
        return this.handleRemoveFromCart(text, foodEntity, sessionId);

      case 'order.place':
        return this.handlePlaceOrder(sessionId, userId);

      case 'order.track':
        return this.handleTrackOrder(sessionId, userId);

      case 'order.cancel':
        return this.buildResponse('To cancel an order, please provide your Order ID. You can find it in your order history.', 'text', intent, score);

      case 'recommend':
        return this.handleRecommend(text, sessionId);

      case 'faq.delivery':
      case 'faq.refund':
      case 'faq.payment':
      case 'thanks':
      case 'goodbye':
      case 'sentiment.angry':
      case 'help':
        return this.buildResponse(nlpResult.answer, 'text', intent, score);

      default:
        return this.handleFallback(text, sessionId);
    }
  }

  // ============================
  // SHOW FULL MENU
  // ============================
  async handleShowMenu(sessionId) {
    const products = await Product.find({ isAvailable: true }).lean();
    // Group by category
    const categories = {};
    products.forEach(p => {
      if (!categories[p.category]) categories[p.category] = [];
      categories[p.category].push(p);
    });

    return {
      text: '🍽️ Here is our complete menu! You can ask me about a specific category like "show me burgers" or say "add Classic Veg Burger to cart".',
      type: 'menu',
      intent: 'menu.show',
      score: 1,
      data: { categories, allProducts: products },
    };
  }

  // ============================
  // SEARCH SPECIFIC FOOD
  // ============================
  async handleSearchFood(text, foodEntity, sessionId) {
    let searchTerm = foodEntity;

    // If NLP didn't extract a food entity, try to extract from text manually
    if (!searchTerm) {
      const keywords = ['burger', 'pizza', 'biryani', 'pasta', 'noodles', 'momos', 'fries',
        'sandwich', 'wrap', 'coke', 'drink', 'dessert', 'brownie', 'lassi', 'coffee'];
      for (const kw of keywords) {
        if (text.toLowerCase().includes(kw)) {
          searchTerm = kw;
          break;
        }
      }
    }

    if (!searchTerm) {
      // Can't figure out what food they want — show full menu
      return this.handleShowMenu(sessionId);
    }

    // Search products matching the term (by category or name)
    const products = await Product.find({
      isAvailable: true,
      $or: [
        { category: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    }).lean();

    if (products.length === 0) {
      return this.buildResponse(
        `Sorry, I couldn't find any "${searchTerm}" items on our menu. Try asking "show menu" to see what's available!`,
        'text', 'order.food', 0.8
      );
    }

    // Store search results in context for follow-up ("add the first one")
    contextManager.updateContext(sessionId, {
      data: { lastSearchResults: products },
    });

    return {
      text: `🔍 I found ${products.length} ${searchTerm} item(s) for you! You can say "add [item name] to cart" to order.`,
      type: 'products',
      intent: 'order.food',
      score: 0.95,
      data: { products },
    };
  }

  // ============================
  // ADD TO CART
  // ============================
  async handleAddToCart(text, foodEntity, sessionId, context) {
    const cart = context.data.cart || [];
    const lastResults = context.data.lastSearchResults || [];

    // Try to figure out which product they want
    let product = null;

    // Check if they said "add the first one", "add the second one"
    const positionMatch = text.match(/(first|second|third|fourth|1st|2nd|3rd|4th|one|two|three)/i);
    if (positionMatch && lastResults.length > 0) {
      const posMap = { first: 0, '1st': 0, one: 0, second: 1, '2nd': 1, two: 1, third: 2, '3rd': 2, three: 2, fourth: 3, '4th': 3 };
      const idx = posMap[positionMatch[1].toLowerCase()] ?? 0;
      product = lastResults[idx] || lastResults[0];
    }

    // Try matching by food entity name
    if (!product && foodEntity) {
      product = await Product.findOne({
        isAvailable: true,
        $or: [
          { name: { $regex: foodEntity, $options: 'i' } },
          { category: { $regex: foodEntity, $options: 'i' } },
        ],
      }).lean();
    }

    // Try matching from the raw text
    if (!product) {
      const allProducts = await Product.find({ isAvailable: true }).lean();
      for (const p of allProducts) {
        if (text.toLowerCase().includes(p.name.toLowerCase()) ||
            text.toLowerCase().includes(p.category.toLowerCase())) {
          product = p;
          break;
        }
      }
    }

    // If we still can't find it, ask the user to specify
    if (!product) {
      // If there were recent search results, set context to wait for selection
      if (lastResults.length > 0) {
        contextManager.updateContext(sessionId, { state: 'AWAITING_CART_SELECTION' });
        return {
          text: '🤔 Which item would you like to add? Please type the name or number from the list above.',
          type: 'products',
          intent: 'cart.add',
          score: 0.8,
          data: { products: lastResults },
        };
      }
      return this.buildResponse(
        'I\'d love to add something to your cart! What food item are you looking for? Try saying "show menu" first.',
        'text', 'cart.add', 0.7
      );
    }

    // Extract quantity
    let qty = 1;
    const qtyMatch = text.match(/(\d+)/);
    if (qtyMatch) qty = parseInt(qtyMatch[1], 10);

    // Add to cart in context
    const existingIdx = cart.findIndex(item => item._id.toString() === product._id.toString());
    if (existingIdx >= 0) {
      cart[existingIdx].qty += qty;
    } else {
      cart.push({ ...product, qty });
    }

    contextManager.updateContext(sessionId, { data: { cart } });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    return {
      text: `✅ Added ${qty}x ${product.name} (₹${product.price}) to your cart!\n\n🛒 Cart total: ₹${total} (${cart.length} item${cart.length > 1 ? 's' : ''})\n\nSay "view cart" to see your cart or "checkout" to place the order.`,
      type: 'cart_update',
      intent: 'cart.add',
      score: 1,
      data: { addedItem: product, qty, cart, total },
    };
  }

  // ============================
  // VIEW CART
  // ============================
  async handleViewCart(sessionId) {
    const context = contextManager.getContext(sessionId);
    const cart = context.data.cart || [];

    if (cart.length === 0) {
      return this.buildResponse(
        '🛒 Your cart is empty! Browse our menu by saying "show menu" or search for specific food like "show me burgers".',
        'text', 'cart.view', 1
      );
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    let cartText = '🛒 **Your Cart:**\n\n';
    cart.forEach((item, i) => {
      cartText += `${i + 1}. ${item.name} x${item.qty} — ₹${item.price * item.qty}\n`;
    });
    cartText += `\n💰 **Total: ₹${total}**\n\nSay "checkout" to place your order or "remove [item]" to remove items.`;

    return {
      text: cartText,
      type: 'cart',
      intent: 'cart.view',
      score: 1,
      data: { cart, total },
    };
  }

  // ============================
  // REMOVE FROM CART
  // ============================
  async handleRemoveFromCart(text, foodEntity, sessionId) {
    const context = contextManager.getContext(sessionId);
    const cart = context.data.cart || [];

    if (text.toLowerCase().includes('clear') || text.toLowerCase().includes('empty') || text.toLowerCase().includes('remove all')) {
      contextManager.updateContext(sessionId, { data: { cart: [] } });
      return this.buildResponse('🗑️ Cart cleared! Your cart is now empty.', 'text', 'cart.remove', 1);
    }

    if (cart.length === 0) {
      return this.buildResponse('Your cart is already empty!', 'text', 'cart.remove', 1);
    }

    // Try to find the item to remove
    let removeIdx = -1;
    if (foodEntity) {
      removeIdx = cart.findIndex(item =>
        item.name.toLowerCase().includes(foodEntity.toLowerCase()) ||
        item.category.toLowerCase().includes(foodEntity.toLowerCase())
      );
    }
    if (removeIdx === -1) {
      for (let i = 0; i < cart.length; i++) {
        if (text.toLowerCase().includes(cart[i].name.toLowerCase())) {
          removeIdx = i;
          break;
        }
      }
    }

    if (removeIdx >= 0) {
      const removed = cart.splice(removeIdx, 1)[0];
      contextManager.updateContext(sessionId, { data: { cart } });
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      return this.buildResponse(
        `🗑️ Removed ${removed.name} from your cart. Cart total: ₹${total}`,
        'text', 'cart.remove', 1
      );
    }

    return this.buildResponse(
      'I couldn\'t find that item in your cart. Say "view cart" to see what\'s in it.',
      'text', 'cart.remove', 0.7
    );
  }

  // ============================
  // PLACE ORDER
  // ============================
  async handlePlaceOrder(sessionId, userId) {
    const context = contextManager.getContext(sessionId);
    const cart = context.data.cart || [];

    if (cart.length === 0) {
      return this.buildResponse(
        'Your cart is empty! Add some items first by browsing the menu.',
        'text', 'order.place', 1
      );
    }

    if (!userId) {
      return this.buildResponse(
        '🔐 Please login first to place your order. You can login from the top-right corner of the page.',
        'text', 'order.place', 1
      );
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Create the order in the database
    const order = await Order.create({
      user: userId,
      orderItems: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.imageUrl,
        price: item.price,
        product: item._id,
      })),
      deliveryAddress: { address: 'Home', city: 'Mumbai', postalCode: '400001' },
      paymentMethod: 'Cash On Delivery',
      totalPrice: total,
    });

    // Clear the cart
    contextManager.updateContext(sessionId, { data: { cart: [], lastOrderId: order._id } });

    return {
      text: `🎉 Order placed successfully!\n\n📦 Order ID: ${order._id}\n💰 Total: ₹${total}\n📍 Status: Pending\n\nYou can track your order by saying "track my order". Thank you for ordering!`,
      type: 'order_confirmation',
      intent: 'order.place',
      score: 1,
      data: { order },
    };
  }

  // ============================
  // TRACK ORDER
  // ============================
  async handleTrackOrder(sessionId, userId) {
    if (!userId) {
      return this.buildResponse('🔐 Please login to track your orders.', 'text', 'order.track', 1);
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3).lean();

    if (orders.length === 0) {
      return this.buildResponse('You have no orders yet. Start by browsing our menu!', 'text', 'order.track', 1);
    }

    const statusEmoji = { pending: '⏳', preparing: '👨‍🍳', out_for_delivery: '🚗', delivered: '✅', cancelled: '❌' };
    let text = '📦 **Your Recent Orders:**\n\n';
    orders.forEach((o, i) => {
      text += `${i + 1}. Order #${o._id.toString().slice(-6)} — ₹${o.totalPrice} — ${statusEmoji[o.status] || ''} ${o.status.replace(/_/g, ' ')}\n`;
    });

    return {
      text,
      type: 'orders',
      intent: 'order.track',
      score: 1,
      data: { orders },
    };
  }

  // ============================
  // RECOMMENDATIONS
  // ============================
  async handleRecommend(text, sessionId) {
    // Check if user asked for a specific food category recommendation
    const foodKeywords = ['burger', 'pizza', 'biryani', 'pasta', 'noodles', 'momos', 'fries',
      'sandwich', 'wrap', 'coke', 'drink', 'dessert', 'brownie', 'lassi', 'coffee'];
    const lowerText = text.toLowerCase();
    let matchedFood = null;
    for (const kw of foodKeywords) {
      if (lowerText.includes(kw)) {
        matchedFood = kw;
        break;
      }
    }

    let products;
    let responseText;

    if (matchedFood) {
      // Food-specific recommendation: search by category/name
      products = await Product.find({
        isAvailable: true,
        $or: [
          { category: { $regex: matchedFood, $options: 'i' } },
          { name: { $regex: matchedFood, $options: 'i' } },
          { description: { $regex: matchedFood, $options: 'i' } },
        ],
      }).lean();
      responseText = products.length > 0
        ? `⭐ Here are our ${matchedFood} recommendations! Say "add [item name] to cart" to order.`
        : `Sorry, I couldn't find any ${matchedFood} items. Try "show menu" to see everything!`;
    } else {
      // Generic recommendation: get random popular items
      products = await Product.aggregate([
        { $match: { isAvailable: true } },
        { $sample: { size: 4 } },
      ]);
      responseText = '⭐ Here are some popular recommendations for you! Say "add [item name] to cart" to order.';
    }

    if (products.length > 0) {
      contextManager.updateContext(sessionId, { data: { lastSearchResults: products } });
    }

    return {
      text: responseText,
      type: products.length > 0 ? 'products' : 'text',
      intent: 'recommend',
      score: 1,
      data: { products },
    };
  }

  // ============================
  // MULTI-TURN CONTEXT HANDLER
  // ============================
  async handleContextState(context, text, sessionId, userId, nlpResult) {
    // If user says something that clearly changes intent, reset context
    const intent = nlpResult.intent;
    if (['menu.show', 'greetings.hello', 'goodbye', 'help'].includes(intent) && nlpResult.score > 0.7) {
      contextManager.updateContext(sessionId, { state: 'IDLE' });
      return this.handleMessage(text, sessionId, userId);
    }

    switch (context.state) {
      case 'AWAITING_CART_SELECTION': {
        const lastResults = context.data.lastSearchResults || [];
        // Try to match input to one of the last search results
        const numMatch = text.match(/(\d+)/);
        let product = null;
        if (numMatch) {
          const idx = parseInt(numMatch[1], 10) - 1;
          product = lastResults[idx];
        }
        if (!product) {
          for (const p of lastResults) {
            if (text.toLowerCase().includes(p.name.toLowerCase()) || text.toLowerCase().includes(p.category)) {
              product = p;
              break;
            }
          }
        }
        if (product) {
          contextManager.updateContext(sessionId, { state: 'IDLE' });
          const cart = context.data.cart || [];
          cart.push({ ...product, qty: 1 });
          contextManager.updateContext(sessionId, { data: { cart } });
          const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
          return {
            text: `✅ Added ${product.name} (₹${product.price}) to your cart!\n\n🛒 Cart total: ₹${total}\n\nSay "view cart" or "checkout" to proceed.`,
            type: 'cart_update',
            intent: 'cart.add',
            score: 1,
            data: { addedItem: product, qty: 1, cart, total },
          };
        }
        return this.buildResponse('I couldn\'t match that to any item. Please type the item name or number.', 'text', 'cart.add', 0.5);
      }
      default:
        contextManager.updateContext(sessionId, { state: 'IDLE' });
        return this.handleMessage(text, sessionId, userId);
    }
  }

  // ============================
  // FALLBACK
  // ============================
  async handleFallback(text, sessionId) {
    // Try a fuzzy product search as a last resort
    const products = await Product.find({
      isAvailable: true,
      $or: [
        { name: { $regex: text.split(' ').filter(w => w.length > 2).join('|'), $options: 'i' } },
        { category: { $regex: text.split(' ').filter(w => w.length > 2).join('|'), $options: 'i' } },
      ],
    }).limit(4).lean();

    if (products.length > 0) {
      contextManager.updateContext(sessionId, { data: { lastSearchResults: products } });
      return {
        text: `I found some items that might match what you're looking for:`,
        type: 'products',
        intent: 'fallback.search',
        score: 0.4,
        data: { products },
      };
    }

    return this.buildResponse(
      '🤔 I\'m not sure I understood that. Here\'s what I can help with:\n\n• "Show menu" — Browse our food menu\n• "I want burger" — Search for specific food\n• "Add to cart" — Add items to your cart\n• "View cart" — See your cart\n• "Checkout" — Place your order\n• "Track order" — Check order status\n\nTry one of these!',
      'text', 'fallback', 0
    );
  }

  // ============================
  // UTILITY
  // ============================
  buildResponse(text, type = 'text', intent = '', score = 0) {
    return { text, type, intent, score, data: {} };
  }
}

export const chatbotHandler = new ChatbotHandler();
