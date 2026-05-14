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
- REMOVE: { "type": "REMOVE", "itemId": string }
- UPDATE: { "type": "UPDATE", "itemId": string, "quantity": number }
Rules:
1. Only use item IDs from the menu below
2. If item not found return actions:[] and ask for clarification
3. If user asks a question not an order return actions:[] and answer warmly
4. Keep replies warm, short, bistro-themed
5. Always valid JSON only
Menu:
${menuText}
Examples:
User: "Add 2 spicy chicken sandwiches"
Response: {"actions":[{"type":"ADD","itemId":"mc_002","itemName":"Spicy Chicken Sandwich","quantity":2}],"reply":"Added 2 Spicy Chicken Sandwiches to your cart!"}
User: "Remove the pizza"
Response: {"actions":[{"type":"REMOVE","itemId":"mc_003"}],"reply":"Removed Margherita Pizza from your cart."}
User: "Change burger quantity to 3"
Response: {"actions":[{"type":"UPDATE","itemId":"mc_001","quantity":3}],"reply":"Updated Grilled Chicken Burger to 3."}`;
const processMessage = async (message, cart, history) => {
  const recentHistory = (history || []).slice(-8);
  const messages = [
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: `${message}\n\nCurrent cart: ${JSON.stringify(cart)}` },
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
    return JSON.parse(cleaned);
  } catch {
    console.error('Claude parse error:', raw);
    throw new Error('Invalid JSON from Claude');
  }
};
module.exports = { processMessage };
