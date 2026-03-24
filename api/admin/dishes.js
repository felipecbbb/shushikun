const { supabase } = require('../lib/supabase');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sushikun2024';

function checkAuth(req) {
  const auth = req.headers.authorization;
  return auth && auth === `Bearer ${ADMIN_PASSWORD}`;
}

module.exports = async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching admin dishes:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, category, image, visible, order } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }

      const { data, error } = await supabase
        .from('dishes')
        .insert({
          name,
          description: description || '',
          category: category || 'Otros',
          image: image || null,
          visible: visible !== undefined ? visible : true,
          order: order !== undefined ? order : 0
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (err) {
      console.error('Error creating dish:', err);
      return res.status(500).json({ error: 'Error creando plato' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
