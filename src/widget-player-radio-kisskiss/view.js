/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

const pollInterval = 7000; // Intervallo di polling in millisecondi (7 secondi)

// Inizializzazione del player audio
function initializeAudioPlayer() {
	console.log("[AUDIO] Inizializzazione player audio...");

	const audioPlayer = document.getElementById("kisskiss-audio-player");
	const playPauseButtons = document.querySelectorAll("#play-pause");
	const volumeSlider = document.querySelector(".kisskiss-volume-slider");

	if (!audioPlayer) {
		console.error("[AUDIO] Elemento audio non trovato");
		return;
	}

	audioPlayer.play().then(() => {
		console.log("[AUDIO] Player avviato con successo");
	}).catch(err => {
		console.error("[AUDIO] Errore durante play:", err);
	});

	if (playPauseButtons.length === 0) {
		console.error("[AUDIO] Pulsanti play/pause non trovati");
		return;
	}

	// Funzione per aggiornare le icone
	function updatePlayIcon(isPlaying) {
		playPauseButtons.forEach(btn => {
			const img = btn.querySelector("img");
			if (img) {
				const pluginUrl = window.kisskissData.pluginUrl;
				if (isPlaying) {
					img.src = pluginUrl + 'pause.svg';
					img.alt = "Pause Icon";
				} else {
					img.src = pluginUrl + 'play.svg';
					img.alt = "Play Icon";
				}
			}
		});
	}

	// Toggle play/pause per tutti i pulsanti
	playPauseButtons.forEach(btn => {
		btn.addEventListener("click", function(e) {
			e.preventDefault();
			console.log("[AUDIO] Play/Pause clicked, stato attuale:", audioPlayer.paused);
			if (audioPlayer.paused) {
				// Al PLAY: ricarica il stream dal live aggiungendo timestamp
				const streamUrl = "https://kisskiss.fluidstream.eu/KissKiss.aac";
				const sourceElement = audioPlayer.querySelector("source");
				
				// Aggiungi timestamp per forzare il fresh fetch del live
				sourceElement.src = streamUrl + "?t=" + Date.now();
				audioPlayer.load(); // Ricarica l'audio
				
				audioPlayer.play().catch(err => {
					console.error("[AUDIO] Errore durante play:", err);
				});
			} else {
				// Al PAUSE: ferma il player
				audioPlayer.pause();
			}
		});
	});

	// Aggiorna icona quando il player cambia stato
	audioPlayer.addEventListener("play", function() {
		console.log("[AUDIO] Player avviato");
		updatePlayIcon(true);
		playPauseButtons.forEach(btn => btn.classList.add("playing"));
	});

	audioPlayer.addEventListener("pause", function() {
		console.log("[AUDIO] Player fermato");
		updatePlayIcon(false);
		playPauseButtons.forEach(btn => btn.classList.remove("playing"));
	});

	audioPlayer.addEventListener("error", function(e) {
		console.error("[AUDIO] Errore caricamento stream:", e);
	});

	// Controllo volume
	if (volumeSlider) {
		volumeSlider.addEventListener("input", function() {
			const volume = this.value / 100;
			audioPlayer.volume = volume;
			console.log("[AUDIO] Volume impostato a:", volume);
		});

		// Imposta volume iniziale
		audioPlayer.volume = volumeSlider.value / 100;
	}

	// Auto-play all'avvio
	console.log("[AUDIO] Avvio auto-play dello stream...");
	audioPlayer.play().then(() => {
		console.log("[AUDIO] Player avviato con successo");
		// Rimuovi il mute per far sentire l'audio
		audioPlayer.muted = false;
		// Aggiorna l'icona a pause
		updatePlayIcon(true);
		// Aggiungi classe playing ai pulsanti
		playPauseButtons.forEach(btn => btn.classList.add("playing"));
	}).catch(err => {
		console.error("[AUDIO] Errore durante auto-play:", err);
	});

	console.log("[AUDIO] Player audio inizializzato");
}

// Polling semplice per aggiornamenti metadata
function initializePolling() {
	console.log("[POLLING] Inizializzazione polling metadata...");

	//const metadataUrl = `${window.location.origin}/wp-json/widget-onair/v1/metadata`;
	const metadataUrl = "https://api.kisskiss.it/nowplaying";
	console.log("[POLLING] URL metadata:", metadataUrl);

	let lastData = null;
	let retryCount = 0;
	const maxRetries = 3;

	async function fetchMetadata() {
		try {
			console.log("[POLLING] Fetching metadata...");

			// Forza no-cache aggiungendo timestamp
			const url = new URL(metadataUrl);
			url.searchParams.append("t", Date.now());

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"Cache-Control": "no-cache, no-store, must-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				},
				cache: "no-store",
			});

			if (!response.ok) {
				console.error("[POLLING] Errore HTTP:", response.status);
				retryCount++;
				if (retryCount < maxRetries) {
					console.warn(`[POLLING] Retry ${retryCount}/${maxRetries}`);
					setTimeout(fetchMetadata, 2000);
				}
				return;
			}

			retryCount = 0; // Reset retry counter on success
			const data = await response.json();
			console.log("[POLLING] Metadata ricevuti:", data);

			// Confronta con i dati precedenti per evitare update inutili
			if (JSON.stringify(data) !== JSON.stringify(lastData)) {
				console.log("[POLLING] Dati modificati, aggiornamento widget...");
				updateWidget(data);
				lastData = data;
			} else {
				console.log("[POLLING] Nessuna modifica ai dati");
			}
		} catch (error) {
			console.error("[POLLING] Errore fetch:", error);
			retryCount++;
			if (retryCount < maxRetries) {
				console.warn(`[POLLING] Retry ${retryCount}/${maxRetries}`);
				setTimeout(fetchMetadata, 2000);
			}
		}
	}

	function updateWidget(data) {
		console.log("pluginUrl:", window.kisskissData.pluginUrl);

		const coverImage = document.getElementById("main-cover");
		const programTitleOverlay = document.getElementById("overlay-current-program-title");
		const spanTitle = document.getElementById("program-title");
		const spanTime = document.getElementById("program-time");
		const songArtist = document.getElementById("song-artist");
		const songArtis2 = document.getElementById("song-artist-2");
		const songTitle = document.getElementById("song-title");
		const kisskissLogo = document.getElementById("kisskiss-logo");
		
		if (coverImage) {
			coverImage.src = data.trackInfo.artwork || window.kisskissData.pluginUrl + "logo.png";
		}
		if (programTitleOverlay) {
			programTitleOverlay.textContent = data.show.title ;
		}
		if (spanTitle) {
			spanTitle.textContent = data.show.title || "";
		}
		if (spanTime) {
			spanTime.textContent = "dalle " + data.show.schedule.start + " alle " + data.show.schedule.end || "";
		}
		if (songArtist) {
			songArtist.textContent = data.trackInfo.artist || "";
		}
		if (songArtis2) {
			songArtis2.textContent = data.trackInfo.artist || "";
		}
		if (songTitle) {
			songTitle.textContent = data.trackInfo.title || "";
		}

	}

	// Esegui il fetch iniziale
	fetchMetadata();

	// Imposta l'intervallo di polling
	setInterval(fetchMetadata, pollInterval);
	console.log(`[POLLING] Polling iniziato - intervallo: ${pollInterval}ms`);
}

// Avvia il polling quando il DOM è pronto
console.log("[POLLING] Script caricato, readyState:", document.readyState);

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		console.log("[POLLING] DOMContentLoaded, inizializzazione...");
		initializeAudioPlayer();
		initializePolling();
	});
} else {
	console.log("[POLLING] DOM già pronto, inizializzazione immediata...");
	initializeAudioPlayer();
	initializePolling();
}
