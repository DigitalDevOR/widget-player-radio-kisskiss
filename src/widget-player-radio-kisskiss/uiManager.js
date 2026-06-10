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
	liveIndicator: null,
	liveText: null,

	init() {
		this.mainCover     = document.getElementById('main-cover');
		this.programTitle  = document.getElementById('program-title');
		this.programTime   = document.getElementById('program-time');
		this.songTitle     = document.getElementById('song-title');
		this.songArtist    = document.getElementById('song-artist');
		this.songArtist2   = document.getElementById('song-artist-2');
		this.overlayTitle  = document.getElementById('overlay-current-program-title');
		this.liveIndicator = document.querySelector('.kisskiss-live-indicator');
		this.liveText      = document.querySelector('.kisskiss-live-text');
	},
};

let currentMode = 'default';

function activateDefaultCta() {
	if (!DOM.liveIndicator) return;
	DOM.liveIndicator.classList.remove('cta');
	if (DOM.liveText) DOM.liveText.textContent = 'In Onda Ora';
}

function activateNotDefaultCta() {
	if (!DOM.liveIndicator) return;
	DOM.liveIndicator.classList.add('cta');
	if (DOM.liveText) DOM.liveText.textContent = '↩ Torna su Kiss Kiss';
}

export function initializeUiManager() {
	DOM.init();

	// Listener CTA: attivo sempre, agisce solo in not-default
	if (DOM.liveIndicator) {
		DOM.liveIndicator.addEventListener('click', () => {
			if (currentMode === 'not-default') {
				document.dispatchEvent(new CustomEvent('RADIO_SELECTED_EVENT', { detail: { default: true } }));
			}
		});
	}

	// ── Default mode ──────────────────────────────────────────────────────────
	document.addEventListener('SET_UI_MODE_DEFAULT', () => {
		currentMode = 'default';
		resetProgramsManager();
		activateDefaultCta();
		const logoUrl = window.kisskissData?.pluginUrl + 'logo.png';
		if (DOM.mainCover) setCoverImageSmoothly(DOM.mainCover, logoUrl);
	});

	// ── Not-default mode ──────────────────────────────────────────────────────
	document.addEventListener('SET_UI_MODE_NOT_DEFAULT', (e) => {
		currentMode = 'not-default';
		resetProgramsManager();
		activateNotDefaultCta();
		const selectedRadio = e.detail;
		if (DOM.mainCover && selectedRadio?.img) {
			setCoverImageSmoothly(DOM.mainCover, selectedRadio.img);
		}
		// Titolo/artista della radio non-default: svuota finché non arriva polling
		if (DOM.songTitle)   DOM.songTitle.textContent   = selectedRadio?.name || '';
		if (DOM.songArtist)  DOM.songArtist.textContent  = '';
		if (DOM.songArtist2) DOM.songArtist2.textContent = '';
	});

	// ── Default radio metadata (sempre aggiornato, in entrambe le modalità) ───
	document.addEventListener('DEFAULT_RADIO_METADATA_UPDATED', (e) => {
		const { trackMetadati, showMetadati } = e.detail || {};

		// Titolo show: in default è "In Onda Ora", in not-default è il riferimento per la CTA
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
			// Aggiorna sempre, anche con stringa vuota, per pulire i valori precedenti
			if (DOM.songTitle)   DOM.songTitle.textContent   = trackMetadati?.title  || '';
			if (DOM.songArtist)  DOM.songArtist.textContent  = trackMetadati?.artist || '';
			if (DOM.songArtist2) DOM.songArtist2.textContent = trackMetadati?.artist || '';

			if (trackMetadati?.artwork) {
				setCoverImageSmoothly(DOM.mainCover, trackMetadati.artwork);
			} else {
				// Nessun artwork traccia: torna al logo default
				const logoUrl = window.kisskissData?.pluginUrl + 'logo.png';
				if (DOM.mainCover) setCoverImageSmoothly(DOM.mainCover, logoUrl);
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
