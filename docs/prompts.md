# Major Prompts 

### Setting up auth

##### gemini

`at @/apps/backend/ follow these things. follow @/docs/how-to-setup-turso.md and connect turso the creds are in .env as DATABASE_URL, DATABASE_TOKEN apply migrations from @/docs/schema.md and use drizzle (install if not available)`

### Initial Frontend design

#### codex

`follow the @/docs/apple-design.md.use tailwind to create components & ui and put resuable components in ui/components/ folder, implement both dark, light mode by default the home page is login page look at @/docs/backend-overview.md understand how backend work, when logged in automatically goto /dashboard page, when not fallback to /. make sure only logged-in users can access /dashboard. leave the dashboard simple empty page with text.`


### First proper schema for this app 

#### gemini 

`check the @/docs/schema.md file i have given you the final schema, now apply migrations, ive already cleared the entire DB, also update the code for this everywhere whatever thing can be shared with other packages since this a monorepo do that, only if it is there a thing to share.`

### Quality of life changes 

#### gemini

`whenever someone sign's up for the first time, create few things
   for him

   Main categories -> food, travel, fees, misc, rent.
   Sub categories ->
    food -> breakfast, lunch, snacks, dinner

   Payment_modes -> UPI, bank, cash, crypto, other.

   Only when this is done tell him sign up is completed,

   Use this rust's style result everywhere where errors can happen,
   type Success<T> = {
       data: T,
       err: null
   };

   type Failure<E> = {
       data: null,
       err: E
   };

   type Result<T, E = Error> = Success<T> | Failure<E>;

   export async function tryCatch<T, E = Error>(promise:
   Promise<T>): Promise<Result<T, E>> {
       try {
           const res = await promise;
           return { data: res, err: null };
       } catch(err) {
           return { data: null, err: err as E };
       }
   }.`

### Removing data duplication 

#### gemini 

`I am using SQLite and I previously created a schema for a personal finance app where the `categories` table had a `user_id` column (for per-user categories).

I have now changed the design to make `categories` and `payment_modes` global (shared across all users).

Please write a safe SQLite migration script to update the existing database accordingly.

Requirements:

1. Modify `categories` table:

   * Remove the `user_id` column completely
   * Keep `id`, `name`, and `parent_id`
   * Preserve existing data (do not lose categories)

2. Ensure `payment_modes` is global:

   * Remove any `user_id` column if it exists
   * Keep it as a simple lookup table with unique names

3. Handle SQLite limitations:

   * Since SQLite does not support dropping columns directly, recreate tables properly using:

     * CREATE new table
     * COPY data
     * DROP old table
     * RENAME new table

4. Preserve all existing data during migration

5. Recreate all foreign key constraints correctly

6. Recreate indexes if they existed

7. Ensure foreign keys are enabled:
   PRAGMA foreign_keys = ON;

8. Make sure the migration is idempotent (safe to run once without breaking)

9. Do NOT modify the `transactions` table except to ensure its foreign keys still work with the updated `categories` and `payment_modes` tables

Output:

* A complete SQLite migration SQL script
* No explanations, only SQL statements
`

### Bug fix & Creating a button to enter records. 

#### codex

`First of all when user sign in is completed he doesnt get redirect to his own dashboard page. Fix that. then create on the dashboard page create a floating action button, make sure it is responsive on mobile it should appear on the bottom right side of screen. on desktop bottom center and open when pressed CTRL+N is pressed. Follow the design @/docs/apple-design.md`

### New Record entry form 

#### codex 

`when the page first loads fetch these things in the background read the @/apps/backend/schemas/index.ts file for the schema
first /categories/main returns
Response data: Array<{ id: number, name: string, parentId: null }> 
second /categories/:parentId/sub
Response data: Array<{ id: number, name: string, parentId: number }>
third 
third /payment-modes 
Response data: Array<{ id: number, name: string }>
after fetching these things store them in localStorage and initially everytime before fetching check whether these items are present in localstorage or not only then fetch, 
if these are not there in localStorage don't allow the add-entry-button work show a popup message saying 'required data not loaded yet'
, and create a form following the design @/docs/apple-design.md now, here's how you'll built the form, at top choose transactionType: credit/debit [tap tab option in row],  next amount [input field], paymentModeId: [Dropdown get payment modes name from localstorage], currency: default inr [input field], reciever Id: [text field], now category fetch from list of category in localStorage [dropdown], description [textarea], Add Record button make sure it responsive and the modal comes out with animation and the form is scrollable` 

### Minor Mistake fixes in form 
#### codex 

`instead of entering the reciever id there's a endpoint called /merchants which returns this Array<{ id: number, name: string }> data get and store it same way the way you store categories and payment_modes, now let the user enter reciever name and you map it out to its ID while uploading, and create a hidden field called sub-category that is only showed when a category is selected and sub-category shows the sub-category of that category How it works now:
   1. If you spend on Rent, category_id = ID of "Rent" (which has parent_id
      = null).
   2. If you spend on Breakfast, category_id = ID of "Breakfast" (which has
      parent_id = <Food_ID>).`

### Form Resizing on different devices 
#### codex 

`why is the form in 9:16 aspect ratio at least on desktop, tablets
  show it as 16:9, and instead of showing Dashboard Signed in as
  text put a refresh button that will re-fetch all the recievers
  name, categories, payment-modes etc.

  And add a bottom nav with dashboard, settings page, and put Floating action button at the center above the nav and it should look like it is cutting the bottom nav bar in curved way,
  
  add the settings page, showing general info of the user. theme toggle buttons should be there and remove them from the top bar. also a logout button, refetching localstorage data button
  the entire app should take same width as it is taking now on desktops 

  follow the @docs/apple-design.md 
  `