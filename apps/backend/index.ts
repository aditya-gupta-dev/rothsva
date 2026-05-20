import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { db } from './src/database';
import { users } from './src/database/schemas';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.use('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.post('/auth/register', async (c) => {
  const { name, email, password } = await c.req.json();
  
  if (!name || !email || !password) {
    return c.json({ error: 'Missing fields' }, 400);
  }

  const hashedPassword = await Bun.password.hash(password);

  try {
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning();

    return c.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (e) {
    return c.json({ error: 'User already exists or other error' }, 400);
  }
});

// Login
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 1 month
  };
  const token = await sign(payload, JWT_SECRET, 'HS256');

  return c.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get('/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const [user] = await db.select().from(users).where(eq(users.id, payload.id)).limit(1);
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user: { id: user.id, name: user.name, email: user.email } });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
