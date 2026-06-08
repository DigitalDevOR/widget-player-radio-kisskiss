/**
 * view.js (completamente ristrutturato)
 * Orchestratore: gestisce la logica dell'UI e coordina tutti i moduli
 */

import { pollingManager } from './pollingManager';
import { initializeAudioPlayer } from './audioPlayer';
import { loadRadioStations, loadRadioPrograms } from './stationLoader';
import { handleProgramTitleChange, resetProgramsManager, getProgramCoverState } from './programsManager';
import { initializeRadioModal } from './modalManager';
import { setCoverImageSmoothly, setImageSrcIfChanged } from './coverTransition';

// ============================================================================
// STATE
// ============================================================================

let DEFAULT_STATION_INDEX = 0;
let radioStations = [];
let currentStationIndex = 0;
let radioPrograms = [];

// ============================================================================
// SELECTORS & CACHING
// ============================================================================

const DOM = {
	coverImage: null,
	programTitleOverlay: null,
	spanTitle: null,
	spanTime: null,
	songArtist: null,
	songArtist2: null,
	songTitle: null,
	h1: null,
	h2: null,
	titlesElement: null,
	liveIndicator: null,
	audioPlayer: null,

	initSelectors() {
		this.coverImage = document.getElementById('main-cover');
		this.programTitleOverlay = document.getElementById('overlay-current-program-title');
		this.spanTitle = document.getElementById('program-title');
		this.spanTime = document.getElementById('program-time');
		this.songArtist = document.getElementById('song-artist');
		this.songArtist2 = document.getElementById('song-artist-2');
		this.songTitle = document.getElementById('song-title');
		this.titlesElement = document.querySelector('.kisskiss-titles');
		this.h1 = this.titlesElement?.querySelector('h1');
		this.h2 = this.titlesElement?.querySelector('h2');
		this.liveIndicator = document.querySelector('.kisskiss-live-indicator');
		this.audioPlayer = document.getElementById('kisskiss-audio-player');
	},
};

// ============================================================================
// METADATA MANAGEMENT
// ============================================================================

/**
 * Aggiorna i titoli della CTA (sempre dalla DEFAULT)
 */
const updateTitleMetadata = (data) => {
	if (!data || !data.show) return;

	if (DOM.spanTitle) DOM.spanTitle.textContent = data.show.title || '';
	if (DOM.h1) DOM.h1.textContent = data.show.title || '';
	if (DOM.programTitleOverlay) DOM.programTitleOverlay.textContent = data.show.title || '';

	// Aggiorna orario slot se presente
	if (DOM.spanTime && data.show.schedule) {
		try {
			const startTime = data.show.schedule.start || '00:00';
			const endTime = data.show.schedule.end || '00:00';
			const [sh, sm] = startTime.split(':').map(Number);
			const [eh, em] = endTime.split(':').map(Number);
			const roundedStart = (sm > 0) ? sh + 1 : sh;
			const roundedEnd = (em > 0) ? eh + 1 : eh;
			DOM.spanTime.textContent = `dalle ${roundedStart.toString().padStart(2, '0')}:00 alle ${roundedEnd.toString().padStart(2, '0')}:00`;
		} catch (e) {
			// ignore
		}
	}
};

/**
 * Aggiorna artista e canzone (dalla stazione attiva)
 */
const updateTrackMetadata = (data) => {
	if (!data || !data.trackInfo) return;

	if (DOM.songArtist) DOM.songArtist.textContent = data.trackInfo.artist || '';
	if (DOM.songArtist2) DOM.songArtist2.textContent = data.trackInfo.artist || '';
	if (DOM.songTitle) DOM.songTitle.textContent = data.trackInfo.title || '';
};

/**
 * Aggiorna la cover image (dalla stazione selezionata)
 */
const updateCoverImage = (imageUrl) => {
	if (!DOM.coverImage || !imageUrl) return;
	setCoverImageSmoothly(DOM.coverImage, imageUrl);
};

/**
 * Dispatch evento di aggiornamento metadati
 */
const dispatchMetadataUpdate = (data) => {
	const programCoverState = getProgramCoverState();
	document.dispatchEvent(new CustomEvent('kisskiss-metadata-update', {
		detail: {
			data,
			programCoverVisible: programCoverState.visible,
			programCoverSrc: programCoverState.coverSrc,
			programCoverCycleActive: !!programCoverState.cycleActive,
		},
	}));
};

// ============================================================================
// POLLING CALLBACKS
// ============================================================================

/**
 * Crea callback per polling updates
 * updateTitles: se true, aggiorna i titoli (dalla DEFAULT)
 * updateTracks: se true, aggiorna artista e canzone (dalla stazione attiva)
 */
const createUpdateMetadataCallback = (endpoint, options = {}) => {
	const { updateTitles = false, updateTracks = false } = options;

	return (data) => {
		// Verifica se l'endpoint corrisponde alla stazione attiva
		const currentStation = radioStations[currentStationIndex];
		const isDefaultActive = currentStationIndex === DEFAULT_STATION_INDEX;
		const defaultEndpoint = radioStations[DEFAULT_STATION_INDEX]?.pollingApiEndpoint || '';

		if (isDefaultActive) {
			// Stazione default attiva: update solo se endpoint è della default
			if (endpoint !== defaultEndpoint) {
				console.log('[VIEW] Callback default ignorato (endpoint non matched)');
				return;
			}
		} else {
			// Stazione non-default attiva: aggiorna solo se endpoint è della stazione attiva
			const stationEndpoint = currentStation?.pollingApiEndpoint;
			if (endpoint !== stationEndpoint) {
				console.log('[VIEW] Callback non-default ignorato (endpoint non matched)');
				return;
			}
		}

		console.log('[VIEW] Polling update ricevuto da:', endpoint);

		// Aggiorna i titoli (sempre dalla DEFAULT)
		if (updateTitles) {
			updateTitleMetadata(data);
		}

		// Aggiorna artista e canzone (dalla stazione attiva)
		if (updateTracks) {
			updateTrackMetadata(data);
		}

		// Gestisci ciclo programmi (solo per stazione default)
		if (isDefaultActive && updateTitles) {
			handleProgramTitleChange(data, radioPrograms);
		}

		// Dispatch evento globale
		dispatchMetadataUpdate(data);
	};
};

// ============================================================================
// POLLING INITIALIZATION
// ============================================================================

/**
 * Inizializza il polling per la stazione default
 */
function initializePolling() {
	const defaultStation = radioStations[DEFAULT_STATION_INDEX];
	const defaultEndpoint = defaultStation?.pollingApiEndpoint || '';

	if (defaultEndpoint && defaultEndpoint.trim() !== '') {
		console.log('[VIEW] Inizializzazione polling stazione default:', defaultStation.name);
		// La default aggiorna i titoli
		pollingManager.start(defaultEndpoint, createUpdateMetadataCallback(defaultEndpoint, { updateTitles: true, updateTracks: true }));
	}
}

/**
 * Aggiorna il polling quando cambia stazione
 */
window.updateStationPolling = (stationIndex) => {
	if (!radioStations[stationIndex]) return;

	const station = radioStations[stationIndex];
	const endpoint = station.pollingApiEndpoint;

	if (stationIndex === DEFAULT_STATION_INDEX) {
		// Ritorno a stazione default: riavvia polling default
		if (radioStations[DEFAULT_STATION_INDEX]?.pollingApiEndpoint) {
			const defaultEndpoint = radioStations[DEFAULT_STATION_INDEX].pollingApiEndpoint;
			pollingManager.stopAllExcept(defaultEndpoint);
			pollingManager.stop(defaultEndpoint);
			pollingManager.start(defaultEndpoint, createUpdateMetadataCallback(defaultEndpoint, { updateTitles: true, updateTracks: true }));
		} else {
			pollingManager.stopAll();
		}
		return;
	}

	// Stazione non-default: avvia polling se ha endpoint
	if (endpoint && endpoint.trim() !== '') {
		console.log('[VIEW] Avvio polling stazione:', station.name);
		// Non-default: aggiorna solo artista e canzone
		pollingManager.start(endpoint, createUpdateMetadataCallback(endpoint, { updateTitles: false, updateTracks: true }));
	} else {
		console.log('[VIEW] Stazione senza endpoint selezionata:', station.name);
	}
};

// ============================================================================
// STATION SELECTION & UI STATE
// ============================================================================

/**
 * Aggiorna lo stato visuale dei metadati e della CTA
 */
const updateMetadataVisibility = (isDefaultStation) => {
	if (!DOM.titlesElement || !DOM.liveIndicator) return;

	if (isDefaultStation) {
		// Default: mostra metadati, rimuovi CTA
		DOM.titlesElement.classList.remove('hidden');
		DOM.liveIndicator.classList.remove('cta');
		DOM.liveIndicator.style.cursor = 'default';
		DOM.liveIndicator.onclick = null;
	} else {
		// Non-default: mostra metadati con CTA attiva
		DOM.titlesElement.classList.remove('hidden');
		DOM.liveIndicator.classList.add('cta');
		DOM.liveIndicator.style.cursor = 'pointer';
		DOM.liveIndicator.onclick = () => onSelectStation(DEFAULT_STATION_INDEX);
	}
};

/**
 * Aggiorna l'audio player
 */
const updateAudioPlayer = (station) => {
	if (!DOM.audioPlayer) return;

	const sourceElement = DOM.audioPlayer.querySelector('source');
	if (!sourceElement) return;

	setImageSrcIfChanged(sourceElement, station.url);
	DOM.audioPlayer.load();
	DOM.audioPlayer.play().catch(() => {});
};

/**
 * Callback principale quando l'utente seleziona una stazione
 */
function onSelectStation(selectedStationIndex) {
	const selectedStation = radioStations[selectedStationIndex];
	const isDefaultStation = selectedStationIndex === DEFAULT_STATION_INDEX;
	const defaultStation = radioStations[DEFAULT_STATION_INDEX];
	const defaultEndpoint = defaultStation?.pollingApiEndpoint || '';

	console.log('[VIEW] Cambio stazione:', selectedStation.name, '| Default:', isDefaultStation);

	// Aggiorna stato stazioni
	radioStations.forEach((s, idx) => s.isActive = idx === selectedStationIndex);
	currentStationIndex = selectedStationIndex;

	// Reset dei programmi (solo per default)
	if (isDefaultStation) {
		resetProgramsManager();
	}

	// Aggiorna cover della stazione selezionata
	const coverUrl = selectedStation.logo || window.kisskissData.pluginUrl + 'logo.png';
	updateCoverImage(coverUrl);

	// Aggiorna audio player
	updateAudioPlayer(selectedStation);

	// Aggiorna visibilità UI e CTA
	updateMetadataVisibility(isDefaultStation);

	// Aggiorna polling
	window.updateStationPolling(selectedStationIndex);

	if (isDefaultStation) {
		// === RITORNO A STAZIONE DEFAULT ===
		console.log('[VIEW] Ritorno a stazione default');

		// Dispatcha i metadati attuali della default
		const lastData = pollingManager.activePollings[defaultEndpoint]?.lastData;

		if (lastData) {
			// Ho dati dal polling attivo
			updateTitleMetadata(lastData);
			updateTrackMetadata(lastData);
			dispatchMetadataUpdate(lastData);
		} else {
			// Nessun dato polling: mostra solo il nome stazione
			const stationData = {
				show: { title: defaultStation.name },
				trackInfo: { artwork: defaultStation.logo, artist: '', title: '' },
			};
			updateTitleMetadata(stationData);
			dispatchMetadataUpdate(stationData);
		}
	} else {
		// === SELEZIONE STAZIONE NON-DEFAULT ===
		console.log('[VIEW] Selezione stazione non-default');

		// Aggiornamento IMMEDIATO dei metadati della webradio selezionata
		const selectedStationData = {
			show: { title: selectedStation.name },
			trackInfo: {
				artwork: selectedStation.logo || window.kisskissData.pluginUrl + 'logo.png',
				artist: '',
				title: '',
			},
		};

		// Aggiorna i metadati della webradio non-default subito
		updateTitleMetadata(selectedStationData);
		updateTrackMetadata(selectedStationData);
		dispatchMetadataUpdate(selectedStationData);

		// Inoltre dispatcha i dati della DEFAULT per lo sticky player
		const lastDataDefault = pollingManager.activePollings[defaultEndpoint]?.lastData;
		if (lastDataDefault) {
			// Dispatcha anche i dati della DEFAULT per sincronizzare lo sticky
			dispatchMetadataUpdate(lastDataDefault);
		}

		// Il polling della webradio (se disponibile) aggiornerà artista e canzone successivamente
	}
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

/**
 * Inizializzazione principale
 */
async function mainInit() {
	console.log('[VIEW] Avvio inizializzazione...');

	// Carica dati
	const pluginUrl = window.kisskissData?.pluginUrl || '';
	const stationsResult = await loadRadioStations(pluginUrl);
	radioStations = stationsResult.stations || [];
	DEFAULT_STATION_INDEX = stationsResult.defaultIndex || 0;
	currentStationIndex = DEFAULT_STATION_INDEX;

	radioPrograms = await loadRadioPrograms(pluginUrl);

	// Inizializza cache DOM
	DOM.initSelectors();

	// Setup audio player
	if (DOM.audioPlayer && radioStations[DEFAULT_STATION_INDEX]) {
		const sourceElement = DOM.audioPlayer.querySelector('source');
		setImageSrcIfChanged(sourceElement, radioStations[DEFAULT_STATION_INDEX].url);
	}

	// Inizializza componenti
	initializeAudioPlayer();
	initializePolling();
	initializeRadioModal(() => radioStations, onSelectStation);

	// Setup UI iniziale
	updateMetadataVisibility(true);
	const defaultCoverUrl = radioStations[DEFAULT_STATION_INDEX].logo || window.kisskissData.pluginUrl + 'logo.png';
	updateCoverImage(defaultCoverUrl);

	console.log('[VIEW] Inizializzazione completata');
}

/**
 * Event listener per Iubenda (specifico per il plugin)
 */
function initializeIubenda() {
	const iubendaButton = document.querySelector('.iubenda-tp-btn iubenda-cs-preferences-link');
	if (iubendaButton) {
		iubendaButton.style.setProperty('margin-bottom', '100px', 'important');
	}
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		mainInit();
		initializeIubenda();
	});
} else {
	mainInit();
	initializeIubenda();
}
