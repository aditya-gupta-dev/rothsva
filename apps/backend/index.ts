import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { db } from './src/database';
import { users, categories, paymentModes } from './src/database/schemas';
import { eq, and } from 'drizzle-orm';
import { tryCatch } from '@zapisi/utils';

const app = new Hono();

app.use('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Registration
app.post('/auth/register', async (c) => {
  const { name, email, password } = await c.req.json();
  
  if (!name || !email || !password) {
    return c.json({ data: null, err: 'Missing fields' }, 400);
  }

  const hashedPassword = await Bun.password.hash(password);

  // 1. Create User
  const userResult = await tryCatch(
    db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
    }).returning()
  );

  if (userResult.err) {
    console.error(userResult.err);
    return c.json({ data: null, err: 'User already exists or registration failed' }, 400);
  }

  const newUser = userResult.data[0];
  if (!newUser) {
    return c.json({ data: null, err: 'Failed to create user' }, 500);
  }

  // 2. Setup defaults (Global categories and payment modes)
  const setupResult = await tryCatch((async () => {
    return await db.transaction(async (tx) => {
      // Payment Modes
      const modes = ['UPI', 'Bank', 'Cash', 'Crypto', 'Other'];
      for (const mode of modes) {
        await tx.insert(paymentModes).values({ name: mode }).onConflictDoNothing();
      }

      // Main Categories (Global)
      const mainCats = ['Food', 'Travel', 'Fees', 'Misc', 'Rent'];

      for (const catName of mainCats) {
        // Check if category exists
        let [existingCat] = await tx.select().from(categories).where(eq(categories.name, catName)).limit(1);
        
        if (!existingCat) {
          [existingCat] = await tx.insert(categories).values({ name: catName }).returning();
        }

        // Sub-categories for Food
        if (catName === 'Food' && existingCat) {
          const subCats = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
          for (const sub of subCats) {
            // Check if subcategory exists for this parent
            const [existingSub] = await tx.select()
              .from(categories)
              .where(and(eq(categories.name, sub), eq(categories.parentId, existingCat.id)))
              .limit(1);
            
            if (!existingSub) {
              await tx.insert(categories).values({
                name: sub,
                parentId: existingCat.id
              });
            }
          }
        }
      }
      return true;
    });
  })());

  if (setupResult.err) {
    console.error('Setup error:', setupResult.err);
    return c.json({ data: null, err: 'User created but failed to verify/setup defaults' }, 500);
  }

  return c.json({ 
    data: { 
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        message: 'Sign up completed'
    }, 
    err: null 
  });
});

// Login
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  const userResult = await tryCatch(
    db.select().from(users).where(eq(users.email, email)).limit(1)
  );

  if (userResult.err || !userResult.data?.[0]) {
    return c.json({ data: null, err: 'Invalid credentials' }, 401);
  }

  const user = userResult.data[0];
  const isPasswordValid = await Bun.password.verify(password, user.passwordHash);

  if (!isPasswordValid) {
    return c.json({ data: null, err: 'Invalid credentials' }, 401);
  }

  const payload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 1 month
  };
  
  const tokenResult = await tryCatch(sign(payload, JWT_SECRET, 'HS256'));

  if (tokenResult.err) {
    return c.json({ data: null, err: 'Failed to generate token' }, 500);
  }

  return c.json({
    data: {
        token: tokenResult.data,
        user: { id: user.id, name: user.name, email: user.email }
    },
    err: null
  });
});

app.get('/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  
  const userResult = await tryCatch(
    db.select().from(users).where(eq(users.id, payload.id)).limit(1)
  );
  
  if (userResult.err || !userResult.data?.[0]) {
    return c.json({ data: null, err: 'User not found' }, 404);
  }

  const user = userResult.data[0];
  return c.json({ 
    data: { user: { id: user.id, name: user.name, email: user.email } },
    err: null 
  });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
