const { supabase } = require('../../lib/supabase');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sushikun2024';

function checkAuth(req) {
  const auth = req.headers.authorization;
  return auth && auth === `Bearer ${ADMIN_PASSWORD}`;
}

function extractStoragePath(imageUrl) {
  if (!imageUrl) return null;
  const marker = '/object/public/dish-images/';
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return imageUrl.substring(idx + marker.length);
}

async function deleteImageFromStorage(imageUrl) {
  const path = extractStoragePath(imageUrl);
  if (!path) return;
  try {
    await supabase.storage.from('dish-images').remove([path]);
  } catch (err) {
    console.error('Error deleting image from storage:', err);
  }
}

module.exports = async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      // Get current dish to check for old image
      const { data: existing, error: fetchError } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Plato no encontrado' });
      }

      const updates = {};
      const body = req.body || {};

      if (body.name !== undefined) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.category !== undefined) updates.category = body.category;
      if (body.visible !== undefined) updates.visible = typeof body.visible === 'string' ? body.visible === 'true' : body.visible;
      if (body.order !== undefined) updates.order = parseInt(body.order);

      if (body.image !== undefined) {
        // If there's a new image and an old one exists, delete the old one
        if (existing.image && body.image !== existing.image) {
          await deleteImageFromStorage(existing.image);
        }
        updates.image = body.image;
      }

      const { data, error } = await supabase
        .from('dishes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (err) {
      console.error('Error updating dish:', err);
      return res.status(500).json({ error: 'Error actualizando plato' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Get dish to find image URL before deleting
      const { data: existing, error: fetchError } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Plato no encontrado' });
      }

      // Delete image from storage
      if (existing.image) {
        await deleteImageFromStorage(existing.image);
      }

      // Delete dish from database
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting dish:', err);
      return res.status(500).json({ error: 'Error eliminando plato' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
