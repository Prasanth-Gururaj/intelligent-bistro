const express = require('express');
const { getAvailableMenu, getCategories } = require('../services/menuService');

const router = express.Router();

router.get('/menu', (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const items = getAvailableMenu().map((it) =>
      it.image && it.image.startsWith('data/')
        ? { ...it, image: `${base}/${it.image}` }
        : it
    );
    res.json({ items });
  } catch (err) {
    console.error('Failed to load menu:', err);
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

router.get('/categories', (_, res) => {
  try {
    res.json({ categories: getCategories() });
  } catch (err) {
    console.error('Failed to load categories:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

module.exports = router;
