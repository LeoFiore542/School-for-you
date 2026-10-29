/** Versione informativa privacy: aggiorna quando cambi il testo legale. */
export const PRIVACY_VERSION = "1.0";

export const PRIVACY_UPDATED_AT = "28 ottobre 2026";

export const PRIVACY_SECTIONS = [
  {
    id: "titolare",
    title: "1. Titolare del trattamento",
    body: [
      "Il titolare del trattamento dei dati personali relativi all’uso di School for you è l’operatore dell’istanza dell’app (il progetto Firebase “school-for-you” collegato a questa applicazione).",
      "Per richieste relative alla privacy puoi contattare il titolare all’indirizzo e-mail associato all’account di amministrazione del progetto Firebase.",
    ],
  },
  {
    id: "dati",
    title: "2. Quali dati trattiamo",
    body: [
      "Dati di account Google: indirizzo e-mail, nome visualizzato, identificativo utente (UID) e, se disponibile, foto profilo. Questi dati sono forniti da Google al momento dell’accesso.",
      "Dati scolastici che inserisci nell’app: materie, orario, voti e relative note.",
      "Metadati tecnici di consenso: data/ora di accettazione dell’informativa e versione del testo accettato.",
      "Dati di sessione/tecnici: token di autenticazione Firebase necessari al funzionamento del login; cache locale sul tuo dispositivo (localStorage) per uso offline e prestazioni.",
    ],
  },
  {
    id: "finalita",
    title: "3. Perché li trattiamo (finalità e base giuridica)",
    body: [
      "Erogare il servizio School for you: sincronizzare e salvare i tuoi dati scolastici tra dispositivi (esecuzione del contratto / servizio richiesto).",
      "Autenticarti in modo sicuro tramite Google Sign-In (interesse legittimo / esecuzione del servizio).",
      "Dimostrare e rispettare il consenso all’informativa privacy (obbligo legale e accountability).",
      "Non usiamo i tuoi dati per profilazione pubblicitaria, marketing di terzi o vendita a terzi.",
    ],
  },
  {
    id: "modo",
    title: "4. Come gestiamo i dati (luogo e modalità)",
    body: [
      "I dati di account e i dati scolastici sono memorizzati su Google Firebase / Google Cloud (Authentication e Cloud Firestore), in infrastruttura gestita da Google.",
      "Ogni utente autenticato può accedere solo ai propri documenti: in Firestore i dati risiedono sotto users/{UID}/… e le regole di sicurezza impediscono l’accesso da parte di altri utenti.",
      "Una copia di cache può restare sul dispositivo (browser) per permettere l’uso anche senza rete; la cache è legata al browser/dispositivo.",
      "La sincronizzazione verso Firestore avviene dopo il login e solo se hai accettato questa informativa.",
      "I log di errore tecnici possono essere generati dal browser o dalla console di sviluppo; non inviamo analitiche pubblicitarie di terze parti tramite questa app.",
    ],
  },
  {
    id: "conservazione",
    title: "5. Conservazione",
    body: [
      "I dati restano memorizzati finché mantieni un account attivo e non richiedi la cancellazione, oppure finché usi l’app.",
      "Puoi chiedere la cancellazione dei dati scolastici dall’app (funzione “Svuota tutto”) e/o eliminare l’account dal progetto Firebase tramite richiesta al titolare.",
      "Dopo la cancellazione, i dati remoti vengono rimossi secondo le procedure di Firebase/Google; la cache locale può essere cancellata svuotando i dati del sito nel browser.",
    ],
  },
  {
    id: "condivisione",
    title: "6. Condivisione e trasferimenti",
    body: [
      "I dati sono trattati tramite fornitori tecnici Google (Firebase Authentication, Cloud Firestore). Si applicano le condizioni e le misure di sicurezza di Google Cloud/Firebase.",
      "Non vendiamo né cediamo i tuoi dati scolastici a terzi per finalità commerciali.",
      "I dati possono essere trattati in data center Google anche fuori dallo Spazio economico europeo, secondo le clausole e le garanzie previste da Google per i servizi cloud.",
    ],
  },
  {
    id: "diritti",
    title: "7. I tuoi diritti",
    body: [
      "Hai diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati, nei limiti della normativa applicabile (es. GDPR).",
      "Puoi revocare il consenso non utilizzando più l’app e richiedendo la cancellazione dei dati; il login successivo richiederà di nuovo l’accettazione di questa informativa se aggiornata.",
      "Hai diritto di proporre reclamo all’autorità di controllo competente (in Italia: Garante per la protezione dei dati personali).",
    ],
  },
  {
    id: "minori",
    title: "8. Minori",
    body: [
      "L’app è pensata per studenti. Se hai meno di 14 anni (o l’età minima prevista nel tuo Paese), l’uso e il consenso devono avvenire con coinvolgimento di un genitore o tutore, secondo la legge applicabile.",
    ],
  },
  {
    id: "modifiche",
    title: "9. Modifiche all’informativa",
    body: [
      `Questa informativa è in versione ${PRIVACY_VERSION} (aggiornata il ${PRIVACY_UPDATED_AT}).`,
      "In caso di modifiche sostanziali aggiorneremo la versione: al successivo accesso potrebbe esserti richiesto di accettare di nuovo il testo aggiornato prima di usare Google Sign-In o sincronizzare i dati.",
    ],
  },
] as const;
