const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const MENU_PATH = path.join(DATA_DIR, 'menu.json');
const CATEGORIES_PATH = path.join(DATA_DIR, 'categories.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));

const getMenu = () => readJson(MENU_PATH);
const getCategories = () => readJson(CATEGORIES_PATH).slice().sort((a, b) => a.displayOrder - b.displayOrder);
const getAvailableMenu = () => getMenu().filter((i) => i.available !== false);

module.exports = { getMenu, getCategories, getAvailableMenu };
