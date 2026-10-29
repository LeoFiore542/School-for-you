# School for you

App personale per studenti delle superiori: orario, materie e voti.
I dati restano in cache sul dispositivo e si sincronizzano su **Firebase Firestore**.

Deploy statico su **GitHub Pages**: [LeoFiore542/School-for-you](https://github.com/LeoFiore542/School-for-you).

## Avvio locale

```bash
npm install
cp .env.example .env.local   # poi inserisci le chiavi Firebase
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

Senza variabili Firebase l’app funziona comunque solo con `localStorage`.

## Funzionalità

- **Oggi** — dashboard con lezioni del giorno e media generale
- **Orario** — griglia settimanale
- **Materie** — CRUD con colori e docenti
- **Voti** — registrazione e medie (anche ponderate)

## Firebase + login Google

1. Configura `.env.local` (vedi `.env.example`) con le chiavi Web del progetto.
2. Abilita **Authentication → Google** e pubblica le regole:

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only auth,firestore:rules
   ```

3. Domini autorizzati Auth: `localhost`, `leofiore542.github.io`.

4. Flusso app: `/login` richiede l’accettazione di `/privacy` prima di Google Sign-In. I dati vanno in `users/{uid}/data/school`.

### Secrets GitHub (per Pages)

In **Settings → Secrets and variables → Actions** del repo crea:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Deploy GitHub Pages

1. Push su `main` (o `master`): il workflow `.github/workflows/deploy-pages.yml` builda l’export statico e pubblica `out/`.
2. In **Settings → Pages** scegli source **GitHub Actions**.
3. URL tipico: `https://leofiore542.github.io/School-for-you/`

Build locale con base path Pages:

```bash
npm run export
npx serve out
```
