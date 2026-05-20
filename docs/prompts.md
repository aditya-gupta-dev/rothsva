# Major Prompts 

### Setting up auth

##### gemini

`at @/apps/backend/ follow these things. 
follow @/docs/how-to-setup-turso.md and connect turso the creds are in .env as DATABASE_URL, DATABASE_TOKEN
apply migrations from @/docs/schema.md and use drizzle (install if not available)`

### Initial Frontend design

#### codex

`follow the @/docs/apple-design.md.use tailwind to create components & ui and put resuable components in ui/components/ folder, implement both dark, light mode by default the home page is login page look at @/docs/backend-overview.md understand how backend work, when logged in automatically goto /dashboard page, when not fallback to /. make sure only logged-in users can access /dashboard. leave the dashboard simple empty page with text.`