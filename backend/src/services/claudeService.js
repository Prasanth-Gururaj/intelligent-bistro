require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { getAvailableMenu } = require('./menuService');
const { buildSystemPrompt } = require('../prompts/bistroPrompt');
const {
  buildCartSummary,
  parseClaudeJson,
  validateActions,
  filterSuggestions,
  normalizeReply,
} = require('../utils/claudeResponse');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const processMessage = async (message, cart, history) => {
  const menu = getAvailableMenu();
  const validIds = new Set(menu.map((i) => i.id));

  const recentHistory = (history || []).slice(-8);
  const cartSummary = buildCartSummary(cart);

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

  const result = parseClaudeJson(response.content[0].text);

  result.actions = validateActions(
    Array.isArray(result.actions) ? result.actions : [],
    validIds,
  );
  result.suggestions = filterSuggestions(
    Array.isArray(result.suggestions) ? result.suggestions : [],
    validIds,
  );
  result.reply = normalizeReply(result.reply);

  return result;
};

module.exports = { processMessage };
