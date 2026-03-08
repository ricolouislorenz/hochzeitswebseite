# 🚀 Deployment Anleitung

Schritt-für-Schritt Anleitung zum Deployen der Hochzeitswebseite auf Cloudflare Pages.

## ✅ Checkliste vor dem Deployment

- [ ] Supabase Projekt erstellt
- [ ] Datenbank-Tabelle `kv_store_bda29bfd` erstellt
- [ ] Supabase Edge Function deployed
- [ ] `/utils/supabase/info.tsx` mit deinen Credentials aktualisiert
- [ ] Admin-Code in `/src/app/components/Login.tsx` geändert
- [ ] Git Repository erstellt

## 📋 Schritt 1: Supabase vorbereiten

### 1.1 Projekt erstellen
```
1. Gehe zu https://supabase.com/dashboard
2. Klicke auf "New Project"
3. Wähle einen Namen und ein Passwort
4. Notiere dir:
   - Project URL
   - Project ID  
   - anon public Key
   - service_role Key
```

### 1.2 Datenbank einrichten
```sql
-- Führe diesen Code im Supabase SQL-Editor aus
CREATE TABLE IF NOT EXISTS kv_store_bda29bfd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kv_store_key_prefix_idx 
ON kv_store_bda29bfd (key text_pattern_ops);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kv_store_updated_at 
BEFORE UPDATE ON kv_store_bda29bfd
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 Edge Function deployen

Die Edge Function muss separat deployed werden, da sie als Deno-Server läuft:

```bash
# 1. Installiere Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link dein Projekt
supabase link --project-ref DEIN_PROJECT_ID

# 4. Deploy die Function
supabase functions deploy make-server-bda29bfd
```

### 1.4 Environment Variables für Edge Function setzen

Gehe zu: Supabase Dashboard → Edge Functions → make-server-bda29bfd → Secrets

Füge hinzu:
```
SUPABASE_URL=https://DEIN_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
OPENAI_API_KEY=dein_openai_key  # Optional für KI-Kategorisierung
```

## 📋 Schritt 2: Code anpassen

### 2.1 Supabase Credentials eintragen
Bearbeite `/utils/supabase/info.tsx`:
```tsx
export const projectId = "DEIN_PROJECT_ID"
export const publicAnonKey = "DEIN_ANON_PUBLIC_KEY"
```

### 2.2 Admin-Code ändern
Bearbeite `/src/app/components/Login.tsx` (Zeile ~19):
```tsx
const ADMIN_CODE = "DEIN_GEHEIMER_CODE";  // Ändere dies!
```

### 2.3 Lokaler Test
```bash
npm install
npm run build
npm run dev  # Teste lokal
```

## 📋 Schritt 3: Git Repository erstellen

```bash
# Initialisiere Git (falls noch nicht geschehen)
git init

# Füge alle Dateien hinzu
git add .

# Erster Commit
git commit -m "Initial commit: Hochzeitswebseite"

# Verbinde mit GitHub/GitLab
git remote add origin https://github.com/DEIN_USERNAME/hochzeitswebseite.git
git branch -M main
git push -u origin main
```

## 📋 Schritt 4: Cloudflare Pages Setup

### Option A: Über Dashboard (einfacher)

1. **Gehe zu Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Workers & Pages → Create application → Pages → Connect to Git

2. **Repository verbinden**
   - Wähle dein Git-Repository
   - Autorisiere Cloudflare

3. **Build Settings**
   ```
   Build command:        npm run build
   Build output:         dist
   Root directory:       /
   ```

4. **Environment Variables** (keine erforderlich für Frontend)
   ```
   NODE_VERSION = 18
   ```

5. **Deploy**
   - Klicke "Save and Deploy"
   - Warte ca. 2-5 Minuten

### Option B: Via Wrangler CLI

```bash
# 1. Installiere Wrangler
npm install -g wrangler

# 2. Login bei Cloudflare
wrangler login

# 3. Build
npm run build

# 4. Deploy
wrangler pages deploy dist --project-name hochzeitswebseite

# 5. Bei jedem Update
npm run build && wrangler pages deploy dist
```

## 📋 Schritt 5: Custom Domain (optional)

1. Gehe zu deinem Cloudflare Pages Projekt
2. Custom Domains → Add custom domain
3. Gebe deine Domain ein (z.B. `unsere-hochzeit.de`)
4. Folge den DNS-Anweisungen:
   - Entweder CNAME zu `hochzeitswebseite.pages.dev`
   - Oder nutze Cloudflare als DNS-Provider

## 🧪 Schritt 6: Testen

### Frontend testen
```
✅ https://deine-seite.pages.dev/
✅ Login mit Gast-Code funktioniert
✅ Login mit Admin-Code funktioniert
✅ RSVP absenden funktioniert
✅ Buffet-Liste wird angezeigt
```

### Backend testen
```
✅ Edge Function erreichbar:
   https://DEIN_PROJECT_ID.supabase.co/functions/v1/make-server-bda29bfd/health

✅ Datenbank-Einträge werden gespeichert
✅ Foto-Upload funktioniert (Storage)
```

## 🔄 Updates deployen

### Bei Git-Verbindung (automatisch)
```bash
git add .
git commit -m "Update: Beschreibung"
git push
# Cloudflare deployt automatisch!
```

### Bei Wrangler CLI (manuell)
```bash
npm run build
wrangler pages deploy dist
```

## 🐛 Troubleshooting

### Problem: "Failed to fetch" bei API Calls
**Lösung**: Prüfe `/utils/supabase/info.tsx` - stimmen die Credentials?

### Problem: Edge Function 404
**Lösung**: Edge Function neu deployen:
```bash
supabase functions deploy make-server-bda29bfd --project-ref DEIN_PROJECT_ID
```

### Problem: Admin-Login funktioniert nicht
**Lösung**: Prüfe `/src/app/components/Login.tsx` - hast du den Code geändert?

### Problem: Routing funktioniert nicht (404 bei /admin)
**Lösung**: Cloudflare Pages braucht SPA-Routing. Ist in `wrangler.toml` konfiguriert.
Falls Problem besteht: Gehe zu Pages → Settings → Functions → _routes.json:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
```

### Problem: Build schlägt fehl
**Lösung**: 
```bash
# Lokalen Build testen
npm run build

# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Monitoring

### Cloudflare Analytics
- Dashboard → Pages → dein Projekt → Analytics
- Zeigt: Besucher, Bandbreite, Requests

### Supabase Logs
- Dashboard → Edge Functions → Logs
- Zeigt: API Calls, Errors, Performance

## 🔐 Sicherheit

### ⚠️ WICHTIG
1. **NIEMALS** den `service_role_key` im Frontend nutzen
2. **IMMER** den Admin-Code vor Deployment ändern
3. **OPTIONAL**: Passwort-Schutz via Cloudflare Access hinzufügen
4. **TIPP**: Nach der Hochzeit Seite deaktivieren oder schützen

### Cloudflare Access (optional)
Für zusätzlichen Schutz vor der Hochzeit:
1. Dashboard → Zero Trust → Access → Applications
2. Add application → Self-hosted
3. Domain: `deine-hochzeit.pages.dev`
4. Policy: Email-basierter Login

## ✅ Fertig!

Deine Hochzeitswebseite ist jetzt live! 🎉

**URLs**:
- Frontend: `https://deine-seite.pages.dev`
- Backend: `https://DEIN_PROJECT_ID.supabase.co/functions/v1/make-server-bda29bfd`
- Admin: `https://deine-seite.pages.dev/admin` (mit Admin-Code)

---

Bei Problemen: README.md lesen oder Cloudflare/Supabase Docs konsultieren.
