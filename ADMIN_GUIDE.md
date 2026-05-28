# KissKiss Player - Admin Dashboard

## Panoramica

Il plugin KissKiss Player include un menu amministrativo completo per gestire le radio e i programmi KissKiss.

## Accesso

Nel menu amministrativo di WordPress, cerca **"KissKiss Player"** nella sezione di sinistra (dashboard admin).

## Funzionalità

### 1. Dashboard
Pagina di benvenuto con overview delle funzionalità disponibili.

**URL:** `wp-admin/admin.php?page=kisskiss-player`

### 2. Gestisci Radio
Pagina per operazioni CRUD (Create, Read, Update, Delete) sulle radio.

**URL:** `wp-admin/admin.php?page=kisskiss-radios`

**Operazioni disponibili:**
- ✅ **Aggiungi Radio** - Aggiungi una nuova radio compilando il form
- ✅ **Modifica Radio** - Clicca "Modifica" su una radio per editarla
- ✅ **Elimina Radio** - Clicca "Elimina" per rimuovere una radio
- ✅ **Visualizza Radios** - Lista di tutte le radio presenti

**Campi obbligatori:**
- **Nome Radio** - Nome della radio (es: "KissKiss", "Radio Italia")
- **URL Immagine/Logo** - URL diretto all'immagine/logo della radio
- **URL Stream Audio** - URL dello stream audio (es: `.aac`, `.mp3`)

**File modificato:** `/data/webradio.json`

### 3. Programmi & Copertine
Pagina per gestire i programmi KissKiss e associare copertine personalizzate.

**URL:** `wp-admin/admin.php?page=kisskiss-programs`

**Operazioni disponibili:**
- ✅ **Aggiungi Programma** - Crea un nuovo programma con copertina
- ✅ **Modifica Programma** - Edita un programma esistente
- ✅ **Elimina Programma** - Rimuovi un programma
- ✅ **Visualizza Programmi** - Vista a griglia con anteprima copertine

**Campi disponibili:**
- **Titolo Programma** - Nome del programma (es: "Marco Ferrero")
- **Orario Inizio** - Ora di inizio (formato 24h)
- **Orario Fine** - Ora di fine (formato 24h)
- **URL Copertina** - URL dell'immagine copertina
  - Button "Seleziona da Libreria" apre il media uploader di WordPress
- **Descrizione** - Breve descrizione del programma (opzionale)

**File modificato:** `/data/kisskiss-programs.json`

## File di Configurazione

### webradio.json
Contiene l'elenco delle radio disponibili. Formato:
```json
[
  {
    "name": "Nome Radio",
    "img": "https://URL_immagine.png",
    "url": "https://URL_stream_audio"
  }
]
```

### kisskiss-programs.json
Contiene i programmi KissKiss con copertine associate. Formato:
```json
[
  {
    "title": "Nome Programma",
    "start_time": "HH:mm",
    "end_time": "HH:mm",
    "cover_url": "https://URL_copertina.png",
    "description": "Descrizione programma"
  }
]
```

## Permessi Richiesti

Per accedere al menu amministrativo è necessario essere **amministratore** del sito (`manage_options`).

## Sicurezza

- ✅ Nonce verification su tutti i form
- ✅ Capability checks (`current_user_can('manage_options')`)
- ✅ Input sanitization con funzioni WordPress native
- ✅ Output escaping su tutte le variabili

## Tips & Tricks

1. **Media Uploader:** Usa il pulsante "Seleziona da Libreria" per caricare copertine dalla libreria media di WordPress
2. **URL diretti:** Puoi anche inserire URL diretti di immagini esterne
3. **Tempo:** Usa il formato 24h (es: 14:30, 23:59)
4. **JSON:** I file JSON vengono generati automaticamente, non modificarli manualmente

## Troubleshooting

### Le modifiche non si salvano
- Verifica che i file `/data/webradio.json` e `/data/kisskiss-programs.json` abbiano permessi di scrittura (0644 o 0755)
- Controlla i permessi della cartella `/data/` (0755)

### Non riesco ad accedere al menu
- Verifica di essere loggato come amministratore
- Pulisci la cache del browser e del server

### Le immagini non si caricano
- Verifica che gli URL siano corretti e raggiungibili
- Prova a caricare le immagini nella libreria media e usa "Seleziona da Libreria"

## Sviluppo Futuro

Funzionalità pianificate:
- 📌 REST API endpoints per gestione programmatica
- 📌 Importazione/Esportazione di configurazioni
- 📌 Validazione URL
- 📌 Caricamento diretto di immagini
