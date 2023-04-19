---
'@supabase/auth-helpers-shared': patch
---

Remove js-base64 as its buffer check was causing issues for Vercel Edge Runtime
