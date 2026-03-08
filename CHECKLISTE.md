# ✅ Deployment Checkliste

Vor dem Go-Live alle Punkte abhaken!

## 🔐 Sicherheit

- [ ] Admin-Code in `/src/app/components/Login.tsx` geändert
- [ ] Supabase `service_role_key` niemals im Frontend verwendet
- [ ] `/utils/supabase/info.tsx` mit korrekten Credentials
- [ ] `.gitignore` vorhanden (`.env` wird nicht committed)

## 🗄️ Supabase Backend

- [ ] Supabase Projekt erstellt
- [ ] Datenbank-Tabelle `kv_store_bda29bfd` erstellt
- [ ] Index auf `key` Spalte erstellt
- [ ] Storage Bucket wird automatisch erstellt (kein manuelles Setup nötig)
- [ ] Edge Function `make-server-bda29bfd` deployed
- [ ] Edge Function Environment Variables gesetzt:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_DB_URL` (optional)
  - [ ] `OPENAI_API_KEY` (optional, nur für KI-Kategorisierung)

## 🎨 Frontend

- [ ] Lokaler Test erfolgreich (`npm run build` && `npm run dev`)
- [ ] Alle Routen funktionieren (/, /admin, /guest/:code, /buffet-view, etc.)
- [ ] Login mit Admin-Code funktioniert
- [ ] Login mit Test-Gast-Code funktioniert
- [ ] RSVP kann abgesendet werden
- [ ] Buffet-Liste wird angezeigt
- [ ] Fotogalerie funktioniert
- [ ] Foto-Upload funktioniert
- [ ] Mobile-Ansicht getestet

## 🚀 Cloudflare Pages

- [ ] Git Repository erstellt (GitHub/GitLab/Bitbucket)
- [ ] Code committed und gepusht
- [ ] Cloudflare Account erstellt
- [ ] Pages Projekt erstellt und mit Git verbunden
- [ ] Build Settings korrekt:
  - [ ] Build command: `npm run build`
  - [ ] Build output: `dist`
  - [ ] Node version: 18+
- [ ] Erste Deployment erfolgreich
- [ ] Website erreichbar unter `.pages.dev` URL

## 🌐 Domain (Optional)

- [ ] Custom Domain verbunden
- [ ] DNS konfiguriert
- [ ] HTTPS aktiv
- [ ] Domain erreichbar

## 🧪 Finale Tests

- [ ] **Start-Seite**: Login-Formular erscheint
- [ ] **Admin-Login**: Mit Admin-Code `/admin` erreichbar
- [ ] **Gast erstellen**: Admin kann Gäste anlegen
- [ ] **Gast-Login**: Mit generiertem Code einloggen
- [ ] **RSVP absenden**: Zu-/Absage funktioniert
- [ ] **Personenanzahl**: Wird korrekt gespeichert
- [ ] **Buffet**: Gast kann Speisen eintragen
- [ ] **Übernachtung**: Auswahl wird gespeichert
- [ ] **Admin-Dashboard**: Statistiken korrekt
- [ ] **Buffet-Übersicht**: Alle Speisen sichtbar
- [ ] **Fotogalerie**: Bilder werden angezeigt
- [ ] **Foto-Upload**: Upload funktioniert
- [ ] **Easter Egg**: `/wedding-game` funktioniert
- [ ] **Mobile**: Alles responsive

## 📱 Vor der Hochzeit

- [ ] Allen Gästen ihren Code zuschicken
- [ ] Deadline für RSVP kommunizieren
- [ ] Gäste über Buffet-Beiträge informieren
- [ ] Übernachtungsmöglichkeiten erklären
- [ ] Link zur Website teilen

## 💡 Optional

- [ ] Cloudflare Analytics aktiviert
- [ ] Supabase Logs-Monitoring eingerichtet
- [ ] Backup der Gästeliste erstellt
- [ ] Custom Favicon erstellt (bereits vorhanden: `/public/favicon.svg`)
- [ ] SEO Meta-Tags angepasst
- [ ] Social-Media Vorschau (og:image) hinzugefügt

## 🎉 Nach dem Go-Live

- [ ] Test-Login durchführen
- [ ] Erste echte RSVP testen
- [ ] Admin-Dashboard prüfen
- [ ] Performance mit Lighthouse testen
- [ ] Mobile-Geräte testen (iOS/Android)
- [ ] Browser-Kompatibilität (Chrome, Safari, Firefox, Edge)

## 📊 Monitoring

- [ ] Cloudflare Pages Analytics checken
- [ ] Supabase Dashboard: Usage checken
- [ ] Edge Function Logs: Errors prüfen
- [ ] Einmal pro Woche: Gästeliste exportieren (Backup)

---

## 🆘 Support Kontakte

- **Cloudflare**: https://developers.cloudflare.com/pages/
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vitejs.dev/
- **React Router**: https://reactrouter.com/

---

## 🎊 Fertig!

Wenn alle Punkte abgehakt sind, kann's losgehen! 💍✨

**Website URL**: `https://_____________________.pages.dev`
**Admin-Code**: `___________________`
**Supabase Project**: `___________________`

---

Viel Erfolg und eine wundervolle Hochzeit! 🥂
