import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { db } from './src/database';
import { users, categories, paymentModes, transactions, merchants } from './src/database/schemas';
import { eq, and, isNull } from 'drizzle-orm';
import { tryCatch } from '@zapisi/utils';

const app = new Hono();

app.use('*', cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Error helper for consistent responses
const errorResponse = (c: any, message: string, status: number = 400) => {
  return c.json({ data: null, err: message }, status);
};

// Registration
app.post('/auth/register', async (c) => {
  const bodyResult = await tryCatch(c.req.json());
  if (bodyResult.err) return errorResponse(c, 'Invalid JSON body', 400);
  
  const { name, email, password } = bodyResult.data;
  
  if (!name || !email || !password) {
    return errorResponse(c, 'Missing required fields: name, email, and password', 400);
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
    return errorResponse(c, 'User with this email already exists', 409);
  }

  const newUser = userResult.data[0];
  if (!newUser) {
    return errorResponse(c, 'Database failed to return new user', 500);
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
        let [existingCat] = await tx.select().from(categories).where(eq(categories.name, catName)).limit(1);
        
        if (!existingCat) {
          [existingCat] = await tx.insert(categories).values({ name: catName }).returning();
        }

        if (catName === 'Food' && existingCat) {
          const subCats = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
          for (const sub of subCats) {
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
    return errorResponse(c, 'User created but default categories setup failed', 500);
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
  const bodyResult = await tryCatch(c.req.json());
  if (bodyResult.err) return errorResponse(c, 'Invalid JSON body', 400);

  const { email, password } = bodyResult.data;

  if (!email || !password) {
    return errorResponse(c, 'Email and password are required', 400);
  }

  const userResult = await tryCatch(
    db.select().from(users).where(eq(users.email, email)).limit(1)
  );

  if (userResult.err || !userResult.data?.[0]) {
    return errorResponse(c, 'Invalid email or password', 401);
  }

  const user = userResult.data[0];
  const isPasswordValid = await Bun.password.verify(password, user.passwordHash);

  if (!isPasswordValid) {
    return errorResponse(c, 'Invalid email or password', 401);
  }

  const payload = {
    id: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 1 month
  };
  
  const tokenResult = await tryCatch(sign(payload, JWT_SECRET, 'HS256'));

  if (tokenResult.err) {
    return errorResponse(c, 'Token generation failed', 500);
  }

  return c.json({
    data: {
        token: tokenResult.data,
        user: { id: user.id, name: user.name, email: user.email }
    },
    err: null
  });
});

// Auth Middleware Protected Routes
const auth = jwt({ secret: JWT_SECRET, alg: 'HS256' });

app.get('/me', auth, async (c) => {
  const payload = c.get('jwtPayload');
  
  const userResult = await tryCatch(
    db.select().from(users).where(eq(users.id, payload.id)).limit(1)
  );
  
  if (userResult.err || !userResult.data?.[0]) {
    return errorResponse(c, 'User session invalid or user not found', 404);
  }

  const user = userResult.data[0];
  return c.json({ 
    data: { user: { id: user.id, name: user.name, email: user.email } },
    err: null 
  });
});

// Categories
app.get('/categories/main', auth, async (c) => {
  const result = await tryCatch(
    db.select().from(categories).where(isNull(categories.parentId))
  );

  if (result.err) return errorResponse(c, 'Failed to fetch main categories', 500);
  
  return c.json({ data: result.data, err: null });
});

app.get('/categories/:parentId/sub', auth, async (c) => {
  const parentId = parseInt(c.req.param('parentId'));
  
  if (isNaN(parentId)) return errorResponse(c, 'Invalid parent category ID', 400);

  const result = await tryCatch(
    db.select().from(categories).where(eq(categories.parentId, parentId))
  );

  if (result.err) return errorResponse(c, 'Failed to fetch sub-categories', 500);
  
  return c.json({ data: result.data, err: null });
});

// Payment Modes
app.get('/payment-modes', auth, async (c) => {
  const result = await tryCatch(db.select().from(paymentModes));
  
  if (result.err) return errorResponse(c, 'Failed to fetch payment modes', 500);
  
  return c.json({ data: result.data, err: null });
});

// Merchants
app.get('/merchants', auth, async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.id;

  // Get unique merchant IDs used by this user
  const result = await tryCatch(
    db.select({
      id: merchants.id,
      name: merchants.name,
    })
    .from(merchants)
    .innerJoin(transactions, eq(transactions.receiverId, merchants.id))
    .where(eq(transactions.userId, userId))
    .groupBy(merchants.id)
  );

  if (result.err) return errorResponse(c, 'Failed to fetch unique merchants', 500);

  return c.json({ data: result.data, err: null });
});

// Transactions
app.post('/transactions', auth, async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.id;
  
  const bodyResult = await tryCatch(c.req.json());
  if (bodyResult.err) return errorResponse(c, 'Invalid JSON body', 400);

  const { 
    transactionType, 
    paymentModeId, 
    amount, 
    currency, 
    receiverId, 
    merchantName,
    categoryId, 
    description, 
    officialTxnId 
  } = bodyResult.data;

  if (!transactionType || amount === undefined) {
    return errorResponse(c, 'Missing required fields: transactionType and amount', 400);
  }

  const result = await tryCatch(db.transaction(async (tx) => {
    let finalReceiverId = receiverId;

    // If merchantName is provided, find or create the merchant
    if (merchantName && typeof merchantName === 'string') {
      const [existingMerchant] = await tx
        .select()
        .from(merchants)
        .where(eq(merchants.name, merchantName))
        .limit(1);

      if (existingMerchant) {
        finalReceiverId = existingMerchant.id;
      } else {
        const [newMerchant] = await tx
          .insert(merchants)
          .values({ name: merchantName })
          .returning();
        finalReceiverId = newMerchant.id;
      }
    }

    return await tx.insert(transactions).values({
      userId,
      transactionType,
      paymentModeId,
      amount,
      currency: currency || 'INR',
      receiverId: finalReceiverId,
      categoryId,
      description,
      officialTxnId
    }).returning();
  }));

  if (result.err) return errorResponse(c, 'Failed to create transaction', 500);

  return c.json({ data: { message: 'Transaction created successfully' }, err: null });
});

app.get('/transactions/:id', auth, async (c) => {
  const payload = c.get('jwtPayload');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) return errorResponse(c, 'Invalid transaction ID', 400);

  const result = await tryCatch(
    db.select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, payload.id)))
      .limit(1)
  );

  if (result.err) return errorResponse(c, 'Failed to fetch transaction', 500);
  if (!result.data?.[0]) return errorResponse(c, 'Transaction not found', 404);

  return c.json({ data: result.data[0], err: null });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
