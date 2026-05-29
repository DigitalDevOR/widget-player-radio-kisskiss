/**
 * view.js (modulare)
 * Orchestratore: importa piccoli moduli e inizializza il player
 */

import { pollingManager } from './pollingManager';
import { initializeAudioPlayer } from './audioPlayer';
import { loadRadioStations, loadRadioPrograms } from './stationLoader';
import { handleProgramTitleChange, resetProgramsManager, getProgramCoverState } from './programsManager';
import { initializeRadioModal } from './modalManager';
import { setCoverImageSmoothly, setImageSrcIfChanged } from './coverTransition';

let DEFAULT_STATION_INDEX = 0;
let radioStations = [];
let currentStationIndex = 0;
let radioPrograms = [];

// Crea callback che aggiorna UI e coordina program manager
const createUpdateMetadataCallback = (endpoint) => {
	return (data) => {
		// Verifica se l'endpoint può aggiornare (solo la stazione attiva)
		const currentStation = radioStations[currentStationIndex];
		const isDefaultActive = currentStationIndex === DEFAULT_STATION_INDEX;
		const defaultEndpoint = radioStations[DEFAULT_STATION_INDEX]?.pollingApiEndpoint || '';

		if (isDefaultActive) {
			if (endpoint !== defaultEndpoint) return;
		} else {
			const stationEndpoint = currentStation?.pollingApiEndpoint;
			if (!stationEndpoint || stationEndpoint.trim() === '' || endpoint !== stationEndpoint) return;
		}

		const coverImage = document.getElementById('main-cover');
		const programTitleOverlay = document.getElementById('overlay-current-program-title');
		const spanTitle = document.getElementById('program-title');
		const spanTime = document.getElementById('program-time');
		const songArtist = document.getElementById('song-artist');
		const songArtis2 = document.getElementById('song-artist-2');
		const songTitle = document.getElementById('song-title');

		if (coverImage) {
			let artworkUrl = data.trackInfo?.artwork;
			const isValidArtwork = artworkUrl && typeof artworkUrl === 'string' && artworkUrl.trim().length > 0 && artworkUrl.trim().toLowerCase() !== 'null';
			const stationLogo = radioStations[currentStationIndex]?.logo || window.kisskissData.pluginUrl + 'logo.png';
			setCoverImageSmoothly(coverImage, isValidArtwork ? artworkUrl.trim() : stationLogo);
		}

		if (programTitleOverlay) programTitleOverlay.textContent = data.show?.title || '';
		if (spanTitle) spanTitle.textContent = data.show?.title || '';
		if (songArtist) songArtist.textContent = data.trackInfo?.artist || '';
		if (songArtis2) songArtis2.textContent = data.trackInfo?.artist || '';
		if (songTitle) songTitle.textContent = data.trackInfo?.title || '';

		// Gestione ora/slot se presenti
		if (spanTime && data.show && data.show.schedule) {
			try {
				const startTime = data.show.schedule.start || '00:00';
				const endTime = data.show.schedule.end || '00:00';
				const [sh, sm] = startTime.split(':').map(Number);
				const [eh, em] = endTime.split(':').map(Number);
				const roundedStart = (sm > 0) ? sh + 1 : sh;
				const roundedEnd = (em > 0) ? eh + 1 : eh;
				spanTime.textContent = `dalle ${roundedStart.toString().padStart(2,'0')}:00 alle ${roundedEnd.toString().padStart(2,'0')}:00`;
			} catch (e) {
				// ignore
			}
		}

		// Delego la logica di mostrare temporaneamente la copertina al modules/programsManager
		handleProgramTitleChange(data, radioPrograms);

		// Dispatch sempre i metadati base con stato overlay programma incluso
		const programCoverState = getProgramCoverState();
		console.log('[VIEW] Dispatching metadata 1:', data);
		document.dispatchEvent(new CustomEvent('kisskiss-metadata-update', {
			detail: {
				data,
				programCoverVisible: programCoverState.visible,
				programCoverSrc: programCoverState.coverSrc,
				programCoverCycleActive: !!programCoverState.cycleActive,
			},
		}))
	};
};

function initializePolling() {
	const defaultStation = radioStations[DEFAULT_STATION_INDEX];
	const defaultEndpoint = defaultStation?.pollingApiEndpoint || '';

	if (defaultEndpoint && defaultEndpoint.trim() !== '') {
		pollingManager.start(defaultEndpoint, createUpdateMetadataCallback(defaultEndpoint));
	}
}

// Aggiorna polling quando cambia stazione
window.updateStationPolling = (stationIndex) => {
	if (!radioStations[stationIndex]) return;
	const station = radioStations[stationIndex];
	const endpoint = station.pollingApiEndpoint;

	if (stationIndex === DEFAULT_STATION_INDEX) {
		if (radioStations[DEFAULT_STATION_INDEX]?.pollingApiEndpoint) {
			const defaultEndpoint = radioStations[DEFAULT_STATION_INDEX].pollingApiEndpoint;
			// Forza il restart del polling di default così il timer copertina riparte anche dopo un rientro
			pollingManager.stopAllExcept(defaultEndpoint);
			pollingManager.stop(defaultEndpoint);
			pollingManager.start(defaultEndpoint, createUpdateMetadataCallback(defaultEndpoint));
		} else {
			pollingManager.stopAll();
		}
		return;
	}

	if (endpoint && endpoint.trim() !== '') {
		pollingManager.start(endpoint, createUpdateMetadataCallback(endpoint));
	} else {
		// station without endpoint: ensure others stopped
		console.log('[POLLING] Stazione senza endpoint selezionata');
	}
};

// Quando l'utente seleziona una stazione dal modal
function onSelectStation(selectedStationIndex) {
	const selectedStation = radioStations[selectedStationIndex];
	const isDefaultStation = selectedStationIndex === DEFAULT_STATION_INDEX;

	const coverImage = document.getElementById('main-cover');
	if (coverImage) {
		if (isDefaultStation) {
			setCoverImageSmoothly(coverImage, radioStations[DEFAULT_STATION_INDEX].logo || window.kisskissData.pluginUrl + 'logo.png');
		} else if (selectedStation.logo) {
			setCoverImageSmoothly(coverImage, selectedStation.logo);
		}
	}

	const audioPlayer = document.getElementById('kisskiss-audio-player');
	if (audioPlayer) {
		const sourceElement = audioPlayer.querySelector('source');
		setImageSrcIfChanged(sourceElement, selectedStation.url);
		audioPlayer.load();
		audioPlayer.play().catch(() => {});
	}

	radioStations.forEach((s, idx) => s.isActive = idx === selectedStationIndex);
	currentStationIndex = selectedStationIndex;

	// Reset program manager when station changes
	resetProgramsManager();

	// Aggiorna polling
	window.updateStationPolling(selectedStationIndex);

	// If returning to default, ensure default polling is active and dispatch last known metadata
	if (isDefaultStation) {
		const defaultEndpoint = radioStations[DEFAULT_STATION_INDEX]?.pollingApiEndpoint || '';
		if (defaultEndpoint && defaultEndpoint.trim() !== '') {
			// Start default polling if not active
			if (!pollingManager.activePollings[defaultEndpoint]) {
				console.log('[POLLING] Riavvio polling per stazione di default:', radioStations[DEFAULT_STATION_INDEX].name);
				pollingManager.start(defaultEndpoint, createUpdateMetadataCallback(defaultEndpoint));
			}
			// Dispatch last known data if available to sync sticky, otherwise send station logo
			const last = pollingManager.activePollings[defaultEndpoint]?.lastData || null;
			const cover = last?.trackInfo?.artwork || radioStations[DEFAULT_STATION_INDEX].logo || window.kisskissData.pluginUrl + 'logo.png';
			const dataToDispatch = last || { show: { title: radioStations[DEFAULT_STATION_INDEX].name }, trackInfo: { artwork: cover, artist: '', title: '' } };
				console.log('[VIEW] Refreshing default metadata via callback:', dataToDispatch);
				createUpdateMetadataCallback(defaultEndpoint)(dataToDispatch);
		} else {
			// No default endpoint: still dispatch logo so sticky updates
			const cover = radioStations[DEFAULT_STATION_INDEX].logo || window.kisskissData.pluginUrl + 'logo.png';
				const fallbackData = { show: { title: radioStations[DEFAULT_STATION_INDEX].name }, trackInfo: { artwork: cover, artist: '', title: '' } };
				console.log('[VIEW] Refreshing default metadata via callback (no endpoint):', fallbackData);
				createUpdateMetadataCallback(defaultEndpoint)(fallbackData);
		}
	}

	// Gestione visibilità metadati
	const titlesElement = document.querySelector('.kisskiss-titles');
	const liveIndicator = document.querySelector('.kisskiss-live-indicator');
	if (isDefaultStation) {
		if (titlesElement) titlesElement.classList.remove('hidden');
		if (liveIndicator) liveIndicator.classList.remove('cta');
		// dispatch metadata for default station if needed
	} else {
		if (titlesElement) titlesElement.classList.add('hidden');
		if (liveIndicator) liveIndicator.classList.add('cta');
		// dispatch metadata update for non-default station so sticky shows station name/logo
		console.log('[VIEW] Dispatching metadata 4:', { show: { title: selectedStation.name }, trackInfo: { artwork: selectedStation.logo, artist: '', title: '' } });
		document.dispatchEvent(new CustomEvent('kisskiss-metadata-update', { detail: {
			data: {
				show: { title: selectedStation.name },
				trackInfo: { artwork: selectedStation.logo, artist: '', title: '' }
			}
		} }));
	}
}

// Inizializzazione principale
async function mainInit() {
	const pluginUrl = window.kisskissData?.pluginUrl || '';
	const stationsResult = await loadRadioStations(pluginUrl);
	radioStations = stationsResult.stations || [];
	DEFAULT_STATION_INDEX = stationsResult.defaultIndex || 0;
	currentStationIndex = DEFAULT_STATION_INDEX;

	// Imposta stream della stazione di default
	const audioPlayer = document.getElementById('kisskiss-audio-player');
	if (audioPlayer && radioStations[DEFAULT_STATION_INDEX]) {
		const sourceElement = audioPlayer.querySelector('source');
		setImageSrcIfChanged(sourceElement, radioStations[DEFAULT_STATION_INDEX].url);
	}

	radioPrograms = await loadRadioPrograms(pluginUrl);

	// Inizializza componenti
	initializeAudioPlayer();
	initializePolling();
	initializeRadioModal(() => radioStations, onSelectStation);

	console.log('[VIEW] Inizializzazione completata');
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mainInit);
} else {
	mainInit();
}
