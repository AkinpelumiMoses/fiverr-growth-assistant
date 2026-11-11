# Supabase

The production schema is provisioned in the Supabase project. Keep schema changes version-controlled as migrations before making future production changes.

Required application environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Only the publishable key belongs in browser-visible configuration. Never put a Supabase secret/service-role key in a NEXT_PUBLIC_ variable or commit it to Git.
