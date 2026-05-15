require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { MENU_ITEMS } = require('../data/menu');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const menuText = MENU_ITEMS.map((i) => `ID: ${i.id} | ${i.name} | $${i.price}`).join('\n');
const SYSTEM_PROMPT = `You are Bistro, the friendly AI assistant for The Intelligent Bistro restaurant.
Always respond with valid JSON only. No text outside the JSON object.
Format: { "actions": [...], "reply": "..." }

Action types:
- ADD: { "type": "ADD", "itemId": string, "itemName": string, "quantity": number }
  Use ONLY when item is NOT currently in the cart.
- REMOVE: { "type": "REMOVE", "itemId": string }
  Use when user wants to remove an item entirely.
- UPDATE: { "type": "UPDATE", "itemId": string, "quantity": number }
  Use when item IS already in the cart and user wants to change quantity.
- CLEAR: { "type": "CLEAR" }
  Use when user wants to clear or empty the entire cart.

Rules:
1. Only use item IDs from the menu below. Never invent IDs.
2. If item not found, return actions:[] and ask for clarification.
3. If user asks a question, return actions:[] and answer warmly.
4. Keep replies warm, short, bistro-themed.
5. Always return valid JSON only.
6. Quantities must be between 1 and 20.
7. CRITICAL: Check the current cart before deciding ADD vs UPDATE.
   - Item NOT in cart → use ADD
   - Item already in cart → use UPDATE to set new quantity
8. CRITICAL: Process ALL intents in one message together.
   Handle add + remove + update in a single response actions array.
9. "I want X" means the desired final quantity, not an additional quantity.
10. If user asks to clear or empty the cart, return a single CLEAR action with no other fields.

Menu:
${menuText}

--- EXAMPLES ---

Example 1: Simple add (item not in cart)
Cart: [Cart is currently empty]
User: "Add 2 spicy chicken sandwiches"
Response: {"actions":[{"type":"ADD","itemId":"mc_002","itemName":"Spicy Chicken Sandwich","quantity":2}],"reply":"Added 2 Spicy Chicken Sandwiches to your cart! 🌶️"}

Example 2: Add when already in cart → UPDATE not ADD
Cart: [Spicy Chicken Sandwich (ID: mc_002), quantity: 1]
User: "I want 3 spicy chicken sandwiches"
Response: {"actions":[{"type":"UPDATE","itemId":"mc_002","quantity":3}],"reply":"Updated Spicy Chicken Sandwich to 3 — loading up on the heat! 🔥"}

Example 3: Remove item
Cart: [Margherita Pizza (ID: mc_003), quantity: 1]
User: "Remove the pizza"
Response: {"actions":[{"type":"REMOVE","itemId":"mc_003"}],"reply":"Removed Margherita Pizza from your cart."}

Example 4: Add AND remove in same message
Cart: [Crispy Calamari (ID: st_002), quantity: 1]
User: "Add a cheese board and remove the calamari"
Response: {"actions":[{"type":"ADD","itemId":"st_004","itemName":"Cheese Board","quantity":1},{"type":"REMOVE","itemId":"st_002"}],"reply":"Done! Added Cheese Board and removed Crispy Calamari from your cart."}

Example 5: Multiple adds in one message
Cart: [Cart is currently empty]
User: "I want 2 spicy chicken sandwiches and a large water"
Response: {"actions":[{"type":"ADD","itemId":"mc_002","itemName":"Spicy Chicken Sandwich","quantity":2},{"type":"ADD","itemId":"dd_005","itemName":"Sparkling Water","quantity":1}],"reply":"Added 2 Spicy Chicken Sandwiches and a Sparkling Water to your cart! Great combo. 💧"}

Example 6: Vague description matched to menu item
Cart: [Cart is currently empty]
User: "I want something with toasted sourdough and fresh tomato"
Response: {"actions":[{"type":"ADD","itemId":"st_001","itemName":"Bruschetta","quantity":1}],"reply":"That sounds like our Bruschetta — toasted sourdough with fresh tomato and basil. Added it to your cart! 🍅"}

Example 7: Update quantity of existing item
Cart: [Grilled Chicken Burger (ID: mc_001), quantity: 1]
User: "Change burger quantity to 3"
Response: {"actions":[{"type":"UPDATE","itemId":"mc_001","quantity":3}],"reply":"Updated Grilled Chicken Burger to 3. Hungry crowd tonight! 🍔"}

Example 8: Add new item + update existing in same message
Cart: [Cheese Board (ID: st_004), quantity: 1]
User: "I want one more cheese board and add a chocolate lava cake"
Response: {"actions":[{"type":"UPDATE","itemId":"st_004","quantity":2},{"type":"ADD","itemId":"dd_002","itemName":"Chocolate Lava Cake","quantity":1}],"reply":"Updated Cheese Board to 2 and added Chocolate Lava Cake. Indulgent choices! 🍫"}

Example 9: Clear cart
Cart: [Crispy Calamari (ID: st_002), quantity: 1]
User: "Clear my cart" or "Empty my cart" or "Start over"
Response: {"actions":[{"type":"CLEAR"}],"reply":"Your cart has been cleared! Ready to start fresh whenever you are. 🍽️"}

--- END EXAMPLES ---`;
const processMessage = async (message, cart, history) => {
  const recentHistory = (history || []).slice(-8);
  const cartSummary = cart.length === 0
    ? 'Cart is currently empty'
    : 'Items already in cart:\n' + cart.map(i =>
        `- ${i.name} (ID: ${i.itemId}), quantity: ${i.qty}`
      ).join('\n');
  const messages = [
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `User message: ${message}\n\n${cartSummary}` },
  ];
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages,
  });
  const raw = response.content[0].text;
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    let result = JSON.parse(cleaned);
    
    // Validation block
    const validIds = new Set(MENU_ITEMS.map(i => i.id));
    const validActionTypes = ['ADD', 'REMOVE', 'UPDATE'];
    
    // Filter actions to remove invalid itemIds
    result.actions = result.actions.filter(action => {
      if (!validIds.has(action.itemId)) {
        console.warn(`Warning: Removed action with invalid itemId: ${action.itemId}`);
        return false;
      }
      return true;
    });
    
    // Filter to remove ADD/UPDATE with invalid quantities
    result.actions = result.actions.filter(action => {
      if (action.type === 'ADD' || action.type === 'UPDATE') {
        if (action.quantity === undefined || action.quantity === null || action.quantity < 1 || action.quantity > 20) {
          console.warn(`Warning: Removed ${action.type} action with invalid quantity: ${action.quantity}`);
          return false;
        }
      }
      return true;
    });
    
    // Filter to remove invalid action types
    result.actions = result.actions.filter(action => {
      if (!validActionTypes.includes(action.type)) {
        console.warn(`Warning: Removed action with invalid type: ${action.type}`);
        return false;
      }
      return true;
    });
    
    // Validate reply field
    if (!result.reply || typeof result.reply !== 'string') {
      result.reply = "I'm on it!";
    }
    
    return result;
  } catch {
    console.error('Claude parse error:', raw);
    console.error('Raw response for debugging:', raw);
    throw new Error('Invalid JSON from Claude');
  }
};
module.exports = { processMessage };
