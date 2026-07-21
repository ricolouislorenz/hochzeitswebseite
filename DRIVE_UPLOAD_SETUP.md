# Google-Drive-Upload einrichten

Die Website lädt Dateien über eine von der Supabase Edge Function erzeugte,
fortsetzbare Upload-Sitzung direkt in diesen Ordner:

- Ordner: `Hochzeit Clara & Rico 18.07.26`
- Ordner-ID: `1RmZGeNmXkl3jOc8J_dtPutA-nKUiob4-`

## 1. Freigabe des Drive-Ordners korrigieren

Der Ordner ist aktuell als „Jeder mit dem Link – Mitbearbeiter“ freigegeben.
Diese Freigabe in Google Drive entfernen und den Ordner privat lassen. Der
Upload der Website erfolgt anschließend über das Google-Konto des Eigentümers.

## 2. Google Drive API und OAuth konfigurieren

1. In der Google Cloud Console das gewünschte Projekt öffnen.
2. Unter „APIs & Dienste“ die **Google Drive API** aktivieren.
3. Den OAuth-Zustimmungsbildschirm konfigurieren.
4. Einen OAuth-Client anlegen.
5. Das Google-Konto `ricolouislorenz@gmail.com` einmalig autorisieren.
6. Einen Refresh Token mit einem Drive-Schreibzugriff erzeugen.

Der Refresh Token muss dauerhaft gültig sein. Befindet sich der
OAuth-Zustimmungsbildschirm nur im Testmodus, können Refresh Tokens nach kurzer
Zeit ablaufen. Vor dem produktiven Einsatz deshalb den Veröffentlichungsstatus
und die Google-OAuth-Einstellungen kontrollieren.

## 3. Supabase-Secrets setzen

Die folgenden Werte niemals in React-Dateien oder Git speichern:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=1RmZGeNmXkl3jOc8J_dtPutA-nKUiob4-
```

Über die Supabase CLI können sie beispielsweise gesetzt werden mit:

```bash
supabase secrets set GOOGLE_CLIENT_ID="..." --project-ref uvmhaetciyoqfkeyiqra
supabase secrets set GOOGLE_CLIENT_SECRET="..." --project-ref uvmhaetciyoqfkeyiqra
supabase secrets set GOOGLE_REFRESH_TOKEN="..." --project-ref uvmhaetciyoqfkeyiqra
supabase secrets set GOOGLE_DRIVE_FOLDER_ID="1RmZGeNmXkl3jOc8J_dtPutA-nKUiob4-" --project-ref uvmhaetciyoqfkeyiqra
```

Alternativ können die vier Werte im Supabase Dashboard unter Edge Functions →
Secrets eingetragen werden.

## 4. Edge Function deployen

Nach dem Setzen der Secrets die bestehende Function neu deployen:

```bash
npx supabase functions deploy make-server-bda29bfd --project-ref uvmhaetciyoqfkeyiqra
```

Der CLI-Einstiegspunkt liegt unter
`supabase/functions/make-server-bda29bfd/index.ts`. Er bindet den bestehenden
Server aus `supabase/functions/server/index.tsx` ein, damit beide Varianten
denselben Backend-Code verwenden.

## 5. Funktionstest

1. Mit einem gültigen siebenstelligen Gästecode anmelden.
2. „Fotos teilen“ öffnen.
3. Zuerst ein kleines JPG auswählen und hochladen.
4. Prüfen, ob es im Zielordner erscheint.
5. Danach HEIC, PDF und ein größeres Video testen.

Unterstützte Dateien und Grenzen:

- JPG, JPEG, PNG, WebP, HEIC und HEIF bis 50 MB
- PDF bis 50 MB
- MP4, MOV und M4V bis 1 GB
- maximal 30 Dateien pro Auswahl
- zwei parallele Uploads

Die Dateien werden in 8-MB-Blöcken übertragen. Bei einem Fehler kann jede Datei
einzeln erneut gestartet werden.
