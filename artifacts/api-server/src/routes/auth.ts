import { Router } from 'express';

const router = Router();

// Single hardcoded admin account
const ADMIN = { username: 'unknown', password: 'unknown', role: 'admin', displayName: 'Unknown' };
const SESSION_TOKEN = 'neonrom-session-unknown-2025';

/** POST /api/auth/login */
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Credenciales requeridas' });
  }

  if (username !== ADMIN.username || password !== ADMIN.password) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  return res.json({
    token: SESSION_TOKEN,
    user: {
      username: ADMIN.username,
      displayName: ADMIN.displayName,
      role: ADMIN.role,
    },
  });
});

/** GET /api/auth/me */
router.get('/auth/me', (req, res) => {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (token !== SESSION_TOKEN) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  return res.json({
    username: ADMIN.username,
    displayName: ADMIN.displayName,
    role: ADMIN.role,
  });
});

/** POST /api/auth/logout */
router.post('/auth/logout', (_req, res) => {
  return res.json({ ok: true });
});

export default router;
