const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// --- Config ---
const ADMIN_PASSWORD = 'sushikun2024';
const DATA_FILE = path.join(__dirname, 'data', 'dishes.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Multer for image uploads ---
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype.split('/')[1]);
    cb(ok ? null : new Error('Solo imagenes JPG, PNG o WebP'), ok);
  }
});

// --- Helpers ---
function readDishes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeDishes(dishes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dishes, null, 2));
}

// --- Simple auth middleware ---
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// --- API: Public ---
app.get('/api/dishes', (req, res) => {
  const dishes = readDishes().filter(d => d.visible !== false);
  res.json(dishes);
});

// --- API: Admin (protected) ---
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  res.status(401).json({ error: 'Contrasena incorrecta' });
});

app.get('/api/admin/dishes', requireAuth, (req, res) => {
  res.json(readDishes());
});

app.post('/api/admin/dishes', requireAuth, upload.single('image'), (req, res) => {
  const dishes = readDishes();
  const dish = {
    id: crypto.randomBytes(8).toString('hex'),
    name: req.body.name,
    description: req.body.description || '',
    category: req.body.category || 'Otros',
    image: req.file ? `/uploads/${req.file.filename}` : null,
    visible: true,
    order: dishes.length,
    createdAt: new Date().toISOString()
  };
  dishes.push(dish);
  writeDishes(dishes);
  res.json(dish);
});

app.put('/api/admin/dishes/:id', requireAuth, upload.single('image'), (req, res) => {
  const dishes = readDishes();
  const idx = dishes.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Plato no encontrado' });

  if (req.body.name) dishes[idx].name = req.body.name;
  if (req.body.description !== undefined) dishes[idx].description = req.body.description;
  if (req.body.category) dishes[idx].category = req.body.category;
  if (req.body.visible !== undefined) dishes[idx].visible = req.body.visible === 'true';
  if (req.body.order !== undefined) dishes[idx].order = parseInt(req.body.order);

  if (req.file) {
    // Delete old image
    if (dishes[idx].image) {
      const oldPath = path.join(__dirname, dishes[idx].image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    dishes[idx].image = `/uploads/${req.file.filename}`;
  }

  writeDishes(dishes);
  res.json(dishes[idx]);
});

app.delete('/api/admin/dishes/:id', requireAuth, (req, res) => {
  let dishes = readDishes();
  const dish = dishes.find(d => d.id === req.params.id);
  if (!dish) return res.status(404).json({ error: 'Plato no encontrado' });

  // Delete image file
  if (dish.image) {
    const imgPath = path.join(__dirname, dish.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  dishes = dishes.filter(d => d.id !== req.params.id);
  writeDishes(dishes);
  res.json({ success: true });
});

// --- SPA routes ---
app.get('/carta', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'carta.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sushi Kun server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
