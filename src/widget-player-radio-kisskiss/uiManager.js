/**
 * uiManager.js
 * Ascolta gli eventi di stato (SET_UI_MODE_*, METADATA_UPDATED)
 * e manipola il DOM del player di conseguenza.
 *
 * Modalità:
 *  - 'default'     → mostra copertina traccia/show + ciclo programma
 *  - 'not-default' → mostra logo radio selezionata + dati entrambi i polling
 *
 * Events listened:
 *  SET_UI_MODE_DEFAULT
 *  SET_UI_MODE_NOT_DEFAULT      detail: radioObject
 *  DEFAULT_RADIO_METADATA_UPDATED   detail: { trackMetadati, showMetadati }
 *  NOT_DEFAULT_RADIO_METADATA_UPDATED detail: { trackMetadati }
 */

import { handleProgramTitleChange, resetProgramsManager } from './programsManager';
import { setCoverImageSmoothly } from './coverTransition';
import kisskissPrograms from '../../data/kisskiss-programs.json';

const DOM = {
	mainCover: null,
	programTitle: null,
	programTime: null,
	songTitle: null,
	songArtist: null,
	songArtist2: null,
	overlayTitle: null,

	init() {
		this.mainCover     = document.getElementById('main-cover');
		this.programTitle  = document.getElementById('program-title');
		this.programTime   = document.getElementById('program-time');
		this.songTitle     = document.getElementById('song-title');
		this.songArtist    = document.getElementById('song-artist');
		this.songArtist2   = document.getElementById('song-artist-2');
		this.overlayTitle  = document.getElementById('overlay-current-program-title');
	},
};

let currentMode = 'default';

export function initializeUiManager() {
	DOM.init();

	// ── Default mode ──────────────────────────────────────────────────────────
	document.addEventListener('SET_UI_MODE_DEFAULT', () => {
		currentMode = 'default';
		resetProgramsManager();
		const logoUrl = window.kisskissData?.pluginUrl + 'logo.png';
		if (DOM.mainCover) setCoverImageSmoothly(DOM.mainCover, logoUrl);
	});

	// ── Not-default mode ──────────────────────────────────────────────────────
	document.addEventListener('SET_UI_MODE_NOT_DEFAULT', (e) => {
		currentMode = 'not-default';
		resetProgramsManager();
		const selectedRadio = e.detail;
		if (DOM.mainCover && selectedRadio?.img) {
			setCoverImageSmoothly(DOM.mainCover, selectedRadio.img);
		}
	});

	// ── Default radio metadata (sempre aggiornato, in entrambe le modalità) ───
	document.addEventListener('DEFAULT_RADIO_METADATA_UPDATED', (e) => {
		const { trackMetadati, showMetadati } = e.detail || {};

		// Titolo show (sempre visibile indipendentemente dalla modalità)
		if (showMetadati?.title) {
			if (DOM.programTitle) DOM.programTitle.textContent = showMetadati.title;
			if (DOM.overlayTitle) DOM.overlayTitle.textContent = showMetadati.title;
		}

		// Orario slot show
		if (showMetadati?.schedule) {
			try {
				const [sh] = (showMetadati.schedule.start || '00:00').split(':').map(Number);
				const [eh] = (showMetadati.schedule.end   || '00:00').split(':').map(Number);
				if (DOM.programTime) {
					DOM.programTime.textContent =
						`${sh.toString().padStart(2, '0')}:00 - ${eh.toString().padStart(2, '0')}:00`;
				}
			} catch (_) { /* ignore */ }
		}

		// In modalità default: aggiorna anche traccia + cover + ciclo programma
		if (currentMode === 'default') {
			if (trackMetadati?.title  && DOM.songTitle)  DOM.songTitle.textContent  = trackMetadati.title;
			if (trackMetadati?.artist && DOM.songArtist) DOM.songArtist.textContent = trackMetadati.artist;
			if (trackMetadati?.artist && DOM.songArtist2) DOM.songArtist2.textContent = trackMetadati.artist;

			if (trackMetadati?.artwork && DOM.mainCover) {
				setCoverImageSmoothly(DOM.mainCover, trackMetadati.artwork);
			}

			handleProgramTitleChange(
				{ show: showMetadati, trackInfo: trackMetadati },
				kisskissPrograms
			);
		}
	});

	// ── Not-default radio metadata (traccia/artista dalla radio non-default) ──
	document.addEventListener('NOT_DEFAULT_RADIO_METADATA_UPDATED', (e) => {
		const { trackMetadati } = e.detail || {};
		if (!trackMetadati) return;

		if (currentMode === 'not-default') {
			if (DOM.songTitle)   DOM.songTitle.textContent   = trackMetadati.title  || '';
			if (DOM.songArtist)  DOM.songArtist.textContent  = trackMetadati.artist || '';
			if (DOM.songArtist2) DOM.songArtist2.textContent = trackMetadati.artist || '';
		}
	});
}
