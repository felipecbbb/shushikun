module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sushikun2024';
  const { password } = req.body || {};

  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, token: ADMIN_PASSWORD });
  }

  return res.status(401).json({ error: 'Contrasena incorrecta' });
};
