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
const DEFAULT_STATION_INDEX = 0; // KissKiss è la stazione di default

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
				// Al PLAY: ricarica il stream corrente aggiungendo timestamp
				const sourceElement = audioPlayer.querySelector("source");
				const currentUrl = sourceElement.src.split('?')[0]; // Rimuovi timestamp precedente
				
				// Aggiungi timestamp per forzare il fresh fetch del live
				sourceElement.src = currentUrl + "?t=" + Date.now();
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

	let retryCount = 0;
	const maxRetries = 3;
	let pollingInterval = null;

	async function fetchMetadata() {
		// Solo se siamo sulla stazione di default (KissKiss)
		if (currentStationIndex !== DEFAULT_STATION_INDEX) {
			console.log("[POLLING] Polling disattivato - stazione non è KissKiss");
			return;
		}

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
			if (JSON.stringify(data) !== JSON.stringify(lastPollingData)) {
				console.log("[POLLING] Dati modificati, aggiornamento widget...");
				updateWidget(data);
				lastPollingData = data;
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
			// Se artwork è null, undefined, stringa vuota, o la stringa "null", usa il logo di KissKiss dal JSON
			let artworkUrl = data.trackInfo?.artwork;
			
			// Controlla se artwork è valido
			const isValidArtwork = artworkUrl 
				&& typeof artworkUrl === 'string' 
				&& artworkUrl.trim().length > 0 
				&& artworkUrl.trim().toLowerCase() !== 'null';
			
			const kisskissLogoUrl = radioStations[DEFAULT_STATION_INDEX]?.logo || window.kisskissData.pluginUrl + 'logo.png';
			const imageUrl = isValidArtwork 
				? artworkUrl.trim() 
				: kisskissLogoUrl;
			
			coverImage.src = imageUrl;
			console.log("[POLLING] Cover aggiornata:", imageUrl, "- Artwork valido:", isValidArtwork);
		}
		if (programTitleOverlay) {
			programTitleOverlay.textContent = data.show.title ;
		}
		if (spanTitle) {
			spanTitle.textContent = data.show.title || "";
		}
		if (spanTime) {
			// Arrotonda per eccesso l'ora di inizio e fine (es: 15:30 → 16:00)
			const startTime = data.show.schedule.start;
			const endTime = data.show.schedule.end;
			
			const [startHours, startMinutes] = startTime.split(':').map(Number);
			const roundedStartHours = startMinutes > 0 ? startHours + 1 : startHours;
			const startTimeDisplay = roundedStartHours.toString().padStart(2, '0') + ':00';
			
			const [hours, minutes] = endTime.split(':').map(Number);
			const roundedEndHours = minutes > 0 ? hours + 1 : hours;
			const endTimeDisplay = roundedEndHours.toString().padStart(2, '0') + ':00';
			
			spanTime.textContent = "dalle " + startTimeDisplay + " alle " + endTimeDisplay || "";
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

	// Esporta fetchMetadata come funzione globale
	globalFetchMetadata = fetchMetadata;

	// Imposta l'intervallo di polling
	setInterval(fetchMetadata, pollInterval);
	console.log(`[POLLING] Polling iniziato - intervallo: ${pollInterval}ms`);
}

// Avvia il polling quando il DOM è pronto
console.log("[POLLING] Script caricato, readyState:", document.readyState);

// Avvia il polling quando il DOM è pronto
console.log("[POLLING] Script caricato, readyState:", document.readyState);

// Variabile globale per le stazioni
let radioStations = [];
let currentStationIndex = 0;

// Variabile globale per i dati di polling (per reset quando si torna a KissKiss)
let lastPollingData = null;

// Funzione globale per il fetch immediato dei metadati
let globalFetchMetadata = null;

// Carica le stazioni dal JSON
async function loadRadioStations() {
	try {
		const pluginUrl = window.kisskissData?.pluginUrl || '';
		const pluginPath = pluginUrl.replace(/\/assets\/$/, '');
		const response = await fetch(pluginPath + '/data/webradio.json');
		
		if (!response.ok) {
			console.error("[RADIO] Errore caricamento JSON:", response.status);
			return false;
		}
		
		const stations = await response.json();
		console.log("[RADIO] Stazioni caricate:", stations);
		
		// Mappa le stazioni dal JSON alla struttura interna
		radioStations = stations.map((station, index) => ({
			id: index,
			name: station.name,
			description: '',
			logo: station.img,
			url: station.url,
			isActive: index === DEFAULT_STATION_INDEX
		}));
		
		// Imposta KissKiss come default
		currentStationIndex = DEFAULT_STATION_INDEX;
		
		// Carica lo stream di KissKiss come default
		const audioPlayer = document.getElementById('kisskiss-audio-player');
		if (audioPlayer && radioStations[DEFAULT_STATION_INDEX]) {
			const sourceElement = audioPlayer.querySelector('source');
			sourceElement.src = radioStations[DEFAULT_STATION_INDEX].url;
			console.log("[RADIO] Stream KissKiss impostato come default");
		}
		
		return true;
	} catch (error) {
		console.error("[RADIO] Errore caricamento stazioni:", error);
		return false;
	}
}

// Gestione modal
function initializeRadioModal() {
	const modal = document.getElementById('kisskiss-radio-modal');
	const openButtons = document.querySelectorAll('#select-radio-btn');
	const closeButton = document.getElementById('kisskiss-modal-close');
	const cancelButton = document.getElementById('kisskiss-modal-cancel');
	const confirmButton = document.getElementById('kisskiss-modal-confirm');
	const stationsGrid = document.getElementById('kisskiss-stations-grid');
	
	if (!modal || !stationsGrid) return;
	
	let selectedStationIndex = null;
	
	// Carica le stazioni nel grid
	function renderStations() {
		stationsGrid.innerHTML = '';
		radioStations.forEach((station, index) => {
			const card = document.createElement('div');
			card.className = `kisskiss-station-card ${station.isActive ? 'active' : ''}`;
			
			// Usa l'immagine dalla stazione (dal JSON), fallback al plugin logo se vuota
			let logoSrc = station.logo && station.logo.trim() ? station.logo : window.kisskissData.pluginUrl + 'logo.png';
			
			// Icona play dal plugin
			const playIcon = window.kisskissData.pluginUrl + 'play.svg';
			
			card.innerHTML = `
				<div class="kisskiss-station-logo">
					<img src="${logoSrc}" alt="${station.name}">
				</div>
				<div class="kisskiss-station-info">
					<h3>${station.name}</h3>
					<p>${station.description}</p>
				</div>
				<div class="kisskiss-station-check">
					<img src="${playIcon}" alt="Play" class="kisskiss-play-icon">
				</div>
			`;
			
			card.addEventListener('click', () => {
				// Rimuovi active da tutti
				document.querySelectorAll('.kisskiss-station-card').forEach(c => {
					c.classList.remove('active');
				});
				// Aggiungi active al cliccato
				card.classList.add('active');
				selectedStationIndex = index;
			});
			
			stationsGrid.appendChild(card);
		});
	}
	
	// Apri modal
	openButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			modal.classList.remove('hidden');
			document.body.style.overflow = 'hidden';
			renderStations();
		});
	});
	
	// Chiudi modal
	function closeModal() {
		modal.classList.add('hidden');
		document.body.style.overflow = '';
		selectedStationIndex = null;
	}
	
	closeButton.addEventListener('click', closeModal);
	cancelButton.addEventListener('click', closeModal);
	
	// Conferma selezione
	confirmButton.addEventListener('click', () => {
		if (selectedStationIndex !== null && radioStations[selectedStationIndex]) {
			const selectedStation = radioStations[selectedStationIndex];
			const isDefaultStation = selectedStationIndex === DEFAULT_STATION_INDEX;
			
			console.log("[RADIO] Stazione selezionata:", selectedStation.name, "- Default:", isDefaultStation);
			
			// Aggiorna l'immagine cover con quella statica della stazione
			const coverImage = document.getElementById('main-cover');
			if (coverImage) {
				if (isDefaultStation) {
					// Torna a KissKiss: mostra subito il logo di KissKiss dal JSON (non aspettare il fetch)
					const kisskissLogo = radioStations[DEFAULT_STATION_INDEX].logo || window.kisskissData.pluginUrl + 'logo.png';
					coverImage.src = kisskissLogo;
					console.log("[RADIO] Cover aggiornata subito a KissKiss:", kisskissLogo);
				} else if (selectedStation.logo) {
					// Altra stazione: mostra il logo della stazione
					coverImage.src = selectedStation.logo;
					console.log("[RADIO] Cover aggiornata a:", selectedStation.name);
				}
			}
			
			// Aggiorna l'audio player con il nuovo URL
			const audioPlayer = document.getElementById('kisskiss-audio-player');
			const sourceElement = audioPlayer.querySelector('source');
			sourceElement.src = selectedStation.url;
			
			// Aggiorna lo stato di tutte le stazioni
			radioStations.forEach((station, index) => {
				station.isActive = index === selectedStationIndex;
			});
			currentStationIndex = selectedStationIndex;
			
			// Gestisci visibilità metadati
			const titlesElement = document.querySelector('.kisskiss-titles');
			const programElement = document.querySelector('.kisskiss-program');
			const liveIndicator = document.querySelector('.kisskiss-live-indicator');
			
			if (isDefaultStation) {
				// Mostra i metadati per KissKiss
				if (titlesElement) titlesElement.classList.remove('hidden');
				if (liveIndicator) {
					const statusSpan = liveIndicator.querySelector('.kisskiss-live-text');
					if (statusSpan) statusSpan.textContent = 'In Onda Ora';
					liveIndicator.classList.remove('cta');
					// Rimuovi event listener precedenti
					const newLiveIndicator = liveIndicator.cloneNode(true);
					liveIndicator.parentNode.replaceChild(newLiveIndicator, liveIndicator);
				}
				console.log("[RADIO] Metadati visibili");
				
				// Reset dei dati di polling per forzare l'aggiornamento della copertina
				lastPollingData = null;
				
				// Esegui subito il fetch dei metadati per aggiornare i dati immediatamente
				if (globalFetchMetadata && typeof globalFetchMetadata === 'function') {
					console.log("[RADIO] Esecuzione fetch immediato dei metadati...");
					globalFetchMetadata();
				}
			} else {
				// Nascondi i metadati per altre stazioni
				if (titlesElement) titlesElement.classList.add('hidden');
				if (liveIndicator) {
					const statusSpan = liveIndicator.querySelector('.kisskiss-live-text');
					if (statusSpan) statusSpan.textContent = 'In Onda Ora su KissKiss';
					liveIndicator.classList.add('cta');
					// Rendi il live indicator cliccabile per tornare a KissKiss
					liveIndicator.addEventListener('click', (e) => {
						e.stopPropagation();
						console.log("[RADIO] CTA cliccato - Ritorno a KissKiss");
						selectedStationIndex = DEFAULT_STATION_INDEX;
						confirmButton.click();
					});
				}
				console.log("[RADIO] Metadati nascosti, CTA attivato");
			}
			
			// Ricarica il player
			audioPlayer.load();
			audioPlayer.play().catch(err => {
				console.error("[RADIO] Errore durante play:", err);
			});
			
			console.log("[POLLING] Cambio stazione - Polling aggiornato");
			closeModal();
		}
	});

	// Drag to dismiss per mobile (trascinare verso il basso dalla barra grigia)
	const modalContainer = modal.querySelector('.kisskiss-modal-container');
	const dragHandle = modal.querySelector('.kisskiss-drag-handle');
	let touchStartY = 0;
	let touchCurrentY = 0;
	let isDragging = false;
	const dragThreshold = 100; // pixel necessari per chiudere

	if (dragHandle) {
		dragHandle.addEventListener('touchstart', (e) => {
			touchStartY = e.touches[0].clientY;
			isDragging = true;
		}, false);
	}

	modalContainer.addEventListener('touchmove', (e) => {
		if (!isDragging) return;
		touchCurrentY = e.touches[0].clientY;
		const drag = touchCurrentY - touchStartY;

		if (drag > 0) {
			modalContainer.style.transform = `translateY(${drag}px)`;
		}
	}, false);

	modalContainer.addEventListener('touchend', (e) => {
		if (!isDragging) return;
		isDragging = false;

		const drag = touchCurrentY - touchStartY;
		modalContainer.style.transition = 'transform 0.3s ease';

		if (drag > dragThreshold) {
			// Chiudi il modale
			modalContainer.style.transform = 'translateY(100%)';
			setTimeout(() => {
				closeModal();
				modalContainer.style.transform = 'translateY(0)';
				modalContainer.style.transition = 'none';
			}, 300);
		} else {
			// Ritorna alla posizione originale
			modalContainer.style.transform = 'translateY(0)';
			setTimeout(() => {
				modalContainer.style.transition = 'none';
			}, 300);
		}
	}, false);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", async () => {
		console.log("[POLLING] DOMContentLoaded, inizializzazione...");
		const stationsLoaded = await loadRadioStations();
		if (!stationsLoaded) {
			console.warn("[RADIO] Fallback: stazioni non caricate dal JSON");
		}
		initializeAudioPlayer();
		initializePolling();
		initializeRadioModal();
	});
} else {
	console.log("[POLLING] DOM già pronto, inizializzazione immediata...");
	loadRadioStations().then(() => {
		initializeAudioPlayer();
		initializePolling();
		initializeRadioModal();
	});
}
