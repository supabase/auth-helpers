---
'@supabase/auth-helpers-sveltekit': patch
---

Add type intellisense for @supabase/auth-helpers-sveltekit/server
Add .js to fix ERR_MODULE_NOT_FOUND (can´t use the script, it throws an error @sveltejs/kit/hooks not found)
Pass page store and invalidation to startSupabaseSessionSync as $app module is not available in npm packages
