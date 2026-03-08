# ⚡ Schnellstart-Guide

Minimale Schritte um die Hochzeitswebseite live zu bringen.

## 1️⃣ Supabase Setup (5 Minuten)

### Projekt erstellen
1. https://supabase.com → "New Project"
2. Notiere: **Project ID** und **anon key**

### Datenbank
Füge im SQL-Editor ein:
```sql
CREATE TABLE kv_store_bda29bfd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Function
```bash
npm install -g supabase
supabase login
supabase link --project-ref DEIN_PROJECT_ID
cd supabase/functions/server
supabase functions deploy make-server-bda29bfd
```

Dann setze im Supabase Dashboard (Edge Functions → Secrets):
```
SUPABASE_URL=https://DEIN_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
```

## 2️⃣ Code anpassen (2 Minuten)

### `/utils/supabase/info.tsx`
```tsx
export const projectId = "DEIN_PROJECT_ID"
export const publicAnonKey = "DEIN_ANON_KEY"
```

### `/src/app/components/Login.tsx` (Zeile 19)
```tsx
const ADMIN_CODE = "DEIN_GEHEIMER_CODE";  // Ändere!
```

## 3️⃣ Auf Cloudflare deployen (3 Minuten)

### Via Dashboard (einfachste Methode)
1. Git Repo erstellen und pushen:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USER/repo.git
   git push -u origin main
   ```

2. https://dash.cloudflare.com → Pages → "Create project"

3. Repository verbinden

4. Build Settings:
   - **Build command**: `npm run build`
   - **Build output**: `dist`

5. Deploy! ✅

### Via CLI (schneller bei Updates)
```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name hochzeitswebseite
```

## 4️⃣ Fertig! 🎉

Deine Website ist live auf: `https://dein-projekt.pages.dev`

### Erster Test:
1. Öffne die URL
2. Gehe zu `/admin` 
3. Login mit deinem Admin-Code
4. Erstelle einen Test-Gast mit Code `TEST123`
5. Logout und login mit `TEST123`

---

**Probleme?** → Siehe `DEPLOYMENT.md` für Details
**Features?** → Siehe `README.md` für alle Funktionen
