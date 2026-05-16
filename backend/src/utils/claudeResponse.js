const VALID_ACTION_TYPES = new Set(['ADD', 'REMOVE', 'UPDATE', 'CLEAR']);

const buildCartSummary = (cart) => cart.length === 0
  ? 'Cart is currently empty'
  : 'Items already in cart:\n' + cart.map((i) =>
      `- ${i.name} (ID: ${i.itemId}), quantity: ${i.qty}`
    ).join('\n');

const parseClaudeJson = (raw) => {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.error('Claude parse error:', raw);
    throw new Error('Invalid JSON from Claude');
  }
};

const validateActions = (actions, validIds) => actions.filter((action) => {
  if (!VALID_ACTION_TYPES.has(action.type)) {
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

const filterSuggestions = (suggestions, validIds) => suggestions
  .filter((id) => typeof id === 'string' && validIds.has(id))
  .slice(0, 3);

const normalizeReply = (reply) =>
  (reply && typeof reply === 'string') ? reply : "I'm on it!";

module.exports = {
  buildCartSummary,
  parseClaudeJson,
  validateActions,
  filterSuggestions,
  normalizeReply,
};
