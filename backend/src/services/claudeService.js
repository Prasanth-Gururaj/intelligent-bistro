require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { getAvailableMenu } = require('./menuService');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SPICE_LABELS = ['none', 'mild', 'medium', 'hot'];

const buildMenuText = (menu) => menu.map((i) => {
  const tags = (i.tags || []).join(', ');
  const dietary = (i.dietary || []).join(', ');
  const spice = SPICE_LABELS[i.spiceLevel ?? 0];
  const parts = [
    `ID: ${i.id}`,
    `${i.name}`,
    `$${i.price}`,
    `category=${i.categoryId}`,
    tags ? `tags=[${tags}]` : null,
    dietary ? `dietary=[${dietary}]` : null,
    `spice=${spice}`,
    (i.pairsWith && i.pairsWith.length) ? `pairsWith=[${i.pairsWith.join(',')}]` : null,
  ].filter(Boolean);
  return parts.join(' | ');
}).join('\n');

const buildSystemPrompt = (menu) => `You are Bistro, the friendly AI assistant for The Intelligent Bistro restaurant.
Always respond with valid JSON only. No text outside the JSON object.
Format: { "actions": [...], "suggestions": [...], "reply": "..." }

Action types:
- ADD: { "type": "ADD", "itemId": string, "itemName": string, "quantity": number }
  Use ONLY when item is NOT currently in the cart.
- REMOVE: { "type": "REMOVE", "itemId": string }
  Use when user wants to remove an item entirely.
- UPDATE: { "type": "UPDATE", "itemId": string, "quantity": number }
  Use when item IS already in the cart and user wants to change quantity.
- CLEAR: { "type": "CLEAR" }
  Use when user wants to clear or empty the entire cart.

Suggestions:
- "suggestions" is an array of menu item IDs (2-3 items) to recommend as visual cards.
- Provide suggestions WHEN:
  (a) The user is vague: "something spicy", "I want something light", "surprise me", "not sure",
      "what do you recommend", "anything good", "what should I get", "I'm hungry", "anything else".
  (b) After an ADD action, suggest a complementary item using pairsWith of the added item(s).
  (c) The user asks for recommendations.
- Do NOT include suggestions if the user gave a specific, fully-actionable order (e.g. "Add 2 spicy chicken sandwiches").
- Suggestions are IDs only; the frontend renders the cards.

Rules:
1. Only use item IDs from the menu below. Never invent IDs.
2. If item not found, return actions:[] and ask for clarification.
3. If user asks a question, return actions:[] and answer warmly.
4. Keep replies warm, short, bistro-themed.
5. Always return valid JSON only.
6. Quantities must be between 1 and 20.
7. CRITICAL: Check the current cart before deciding ADD vs UPDATE.
8. CRITICAL: Process ALL intents in one message together.
9. "I want X" means the desired final quantity, not an additional quantity.
10. If user asks to clear or empty the cart, return a single CLEAR action.
11. When using suggestions, prefer items matching the user's hints (tags, dietary, spice).

Menu (with tags/dietary/spice/pairsWith):
${buildMenuText(menu)}

--- EXAMPLES ---

Example 1: Simple add (item not in cart)
Cart: [Cart is currently empty]
User: "Add 2 spicy chicken sandwiches"
Response: {"actions":[{"type":"ADD","itemId":"mc_002","itemName":"Spicy Chicken Sandwich","quantity":2}],"suggestions":[],"reply":"Added 2 Spicy Chicken Sandwiches to your cart!"}

Example 2: Vague request → suggestions only
Cart: [Cart is currently empty]
User: "I want something spicy"
Response: {"actions":[],"suggestions":["mc_002"],"reply":"Here's a spicy pick from our menu — want me to add it for you?"}

Example 3: Vague + unsure
Cart: [Cart is currently empty]
User: "I'm not sure what to order"
Response: {"actions":[],"suggestions":["mc_003","mc_001","dd_002"],"reply":"No worries — here are a few of our most-loved dishes to consider."}

Example 4: Add + pairing suggestion
Cart: [Cart is currently empty]
User: "Add a ribeye steak"
Response: {"actions":[{"type":"ADD","itemId":"mc_004","itemName":"Ribeye Steak","quantity":1}],"suggestions":["st_004","dd_003"],"reply":"Added the Ribeye Steak — pairs beautifully with a cheese board or fresh lemonade."}

Example 5: Update existing
Cart: [Spicy Chicken Sandwich (ID: mc_002), quantity: 1]
User: "I want 3 spicy chicken sandwiches"
Response: {"actions":[{"type":"UPDATE","itemId":"mc_002","quantity":3}],"suggestions":[],"reply":"Updated Spicy Chicken Sandwich to 3 — loading up on the heat!"}

Example 6: Remove
Cart: [Margherita Pizza (ID: mc_003), quantity: 1]
User: "Remove the pizza"
Response: {"actions":[{"type":"REMOVE","itemId":"mc_003"}],"suggestions":[],"reply":"Removed Margherita Pizza from your cart."}

Example 7: Clear
Cart: [Crispy Calamari (ID: st_002), quantity: 1]
User: "Clear my cart"
Response: {"actions":[{"type":"CLEAR"}],"suggestions":[],"reply":"Your cart has been cleared! Ready to start fresh."}

Example 8: Dietary-aware suggestion
Cart: [Cart is currently empty]
User: "Anything vegetarian?"
Response: {"actions":[],"suggestions":["st_001","mc_003","dd_002"],"reply":"Yes! Here are some vegetarian options from our menu."}

--- END EXAMPLES ---`;

const processMessage = async (message, cart, history) => {
  const menu = getAvailableMenu();
  const validIds = new Set(menu.map((i) => i.id));
  const validActionTypes = new Set(['ADD', 'REMOVE', 'UPDATE', 'CLEAR']);

  const recentHistory = (history || []).slice(-8);
  const cartSummary = cart.length === 0
    ? 'Cart is currently empty'
    : 'Items already in cart:\n' + cart.map((i) =>
        `- ${i.name} (ID: ${i.itemId}), quantity: ${i.qty}`
      ).join('\n');

  const messages = [
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `User message: ${message}\n\n${cartSummary}` },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 600,
    temperature: 0,
    system: buildSystemPrompt(menu),
    messages,
  });

  const raw = response.content[0].text;
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch {
    console.error('Claude parse error:', raw);
    throw new Error('Invalid JSON from Claude');
  }

  result.actions = Array.isArray(result.actions) ? result.actions : [];
  result.suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];

  result.actions = result.actions.filter((action) => {
    if (!validActionTypes.has(action.type)) {
      console.warn(`Removed action with invalid type: ${action.type}`);
      return false;
    }
    if (action.type === 'CLEAR') return true;
    if (!validIds.has(action.itemId)) {
      console.warn(`Removed action with invalid itemId: ${action.itemId}`);
      return false;
    }
    if (action.type === 'ADD' || action.type === 'UPDATE') {
      const q = action.quantity;
      if (typeof q !== 'number' || q < 1 || q > 20 || !Number.isFinite(q)) {
        console.warn(`Removed ${action.type} action with invalid quantity: ${q}`);
        return false;
      }
    }
    return true;
  });

  result.suggestions = result.suggestions
    .filter((id) => typeof id === 'string' && validIds.has(id))
    .slice(0, 3);

  if (!result.reply || typeof result.reply !== 'string') {
    result.reply = "I'm on it!";
  }

  return result;
};

module.exports = { processMessage };
