# 💍 Hochzeitswebseite

Eine moderne, elegante Hochzeitswebseite mit Admin-Bereich, Gästeverwaltung, RSVP-System, Buffetliste und interaktivem Hochzeitsspiel.

## 🎨 Features

- 🎫 **Gäste-Login**: 7-stelliger einzigartiger Code für jeden Gast
- ✅ **RSVP-System**: Zu-/Absage mit Personenanzahl
- 🍽️ **Buffet-Verwaltung**: Gäste können Speisen eintragen mit KI-Kategorisierung
- 🏠 **Übernachtung**: Schlafplatzverwaltung für Gäste
- 📸 **Fotogalerie**: Photobook-Style Galerie für Hochzeitsbilder
- 📤 **Foto-Upload**: Gäste können eigene Fotos teilen
- 👨‍💼 **Admin-Dashboard**: Komplette Gästeverwaltung und Statistiken
- 🎮 **Easter Egg**: Hochzeits-Runner-Spiel (404-Seite)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + Glassmorphism-Effekte
- **Routing**: React Router v7
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Build**: Vite
- **Hosting**: Cloudflare Pages

## 📦 Installation

### Voraussetzungen
- Node.js 18+ und npm/pnpm
- Supabase Account (kostenlos)
- Cloudflare Account (kostenlos)

### 1. Repository klonen & Dependencies installieren

```bash
# Mit npm
npm install

# Oder mit pnpm (empfohlen)
pnpm install
```

### 2. Supabase Backend einrichten

#### Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Notiere dir:
   - Project URL (z.B. `https://uvmhaetciyoqfkeyiqra.supabase.co`)
   - Project ID (z.B. `uvmhaetciyoqfkeyiqra`)
   - `anon` public API Key
   - `service_role` secret Key (unter Settings → API)

#### Datenbank einrichten
Die App nutzt eine KV-Store Tabelle. Führe folgenden SQL-Befehl in deinem Supabase SQL-Editor aus:

```sql
-- Key-Value Store für Gäste, RSVPs, Buffet-Items
CREATE TABLE IF NOT EXISTS kv_store_bda29bfd (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Prefix-Suche
CREATE INDEX IF NOT EXISTS kv_store_key_prefix_idx ON kv_store_bda29bfd (key text_pattern_ops);

-- Auto-Update für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kv_store_updated_at BEFORE UPDATE ON kv_store_bda29bfd
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Storage Bucket einrichten (für Foto-Uploads)
```sql
-- Storage Bucket wird automatisch vom Server erstellt
-- Keine manuelle Aktion erforderlich
```

#### Edge Function deployen

1. Installiere die Supabase CLI:
```bash
npm install -g supabase
```

2. Login bei Supabase:
```bash
supabase login
```

3. Link dein Projekt:
```bash
supabase link --project-ref DEIN_PROJECT_ID
```

4. Deploye die Edge Function:
```bash
supabase functions deploy make-server-bda29bfd --project-ref DEIN_PROJECT_ID
```

5. Setze die Umgebungsvariablen für die Edge Function:
```bash
# In deinem Supabase Dashboard → Edge Functions → make-server-bda29bfd → Secrets
SUPABASE_URL=https://DEIN_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=dein_anon_key
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
OPENAI_API_KEY=dein_openai_key  # Optional, nur für KI-Kategorisierung
```

### 3. Frontend konfigurieren

Bearbeite `/utils/supabase/info.tsx`:

```tsx
export const projectId = "DEIN_PROJECT_ID"
export const publicAnonKey = "DEIN_ANON_PUBLIC_KEY"
```

### 4. Lokale Entwicklung

```bash
npm run dev
# oder
pnpm dev
```

Die App läuft dann auf `http://localhost:5173`

## 🚀 Deployment auf Cloudflare Pages

### Option 1: Über Git (empfohlen)

1. Push dein Projekt zu GitHub/GitLab/Bitbucket

2. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → "Create a project"

3. Verbinde dein Git-Repository

4. Konfiguriere das Build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 18+

5. Setze die Umgebungsvariablen:
   ```
   NODE_VERSION=18
   ```

6. Klicke auf "Save and Deploy"

### Option 2: Direkt via Wrangler CLI

```bash
# Installiere Wrangler
npm install -g wrangler

# Login bei Cloudflare
wrangler login

# Build das Projekt
npm run build

# Deploy
wrangler pages deploy dist --project-name hochzeitswebseite
```

### Domain verbinden (optional)

1. Gehe zu deinem Cloudflare Pages Projekt
2. Custom Domains → Add custom domain
3. Folge den Anweisungen zur DNS-Konfiguration

## 🔐 Admin-Zugang

Der Admin-Zugang ist hart codiert in `/src/app/components/Login.tsx`:

```tsx
const ADMIN_CODE = "ADMIN99";
```

**⚠️ WICHTIG**: Ändere diesen Code vor dem Deployment!

## 🎯 Admin-Funktionen

Nach Login mit dem Admin-Code:
- Gäste erstellen/bearbeiten/löschen
- RSVP-Statistiken einsehen
- Buffet-Übersicht
- Übernachtungsverwaltung
- Gästecodes generieren

## 🎨 Design-System

Das Projekt nutzt ein Hochzeits-Farbschema:
- **Blush Rosé**: `#E8C7C8`
- **Salbeigrün**: `#A3B18A`
- **Elfenbein**: `#F6F1E9`
- **Warmes Gold**: `#C6A75E`

Mit modernen Glasmorphism-Effekten und Pastellfarben.

## 🎮 Easter Egg

Besuche eine nicht existierende Route (z.B. `/404` oder `/wedding-game`) um das versteckte Hochzeits-Runner-Spiel zu spielen!

## 📝 Lizenz

Privates Hochzeitsprojekt - Alle Rechte vorbehalten.

## 🛟 Support

Bei Fragen zum Deployment:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)

---

Viel Spaß und eine wundervolle Hochzeit! 💍✨
