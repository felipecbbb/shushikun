const { supabase } = require('./lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('visible', true)
      .order('order', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching dishes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
