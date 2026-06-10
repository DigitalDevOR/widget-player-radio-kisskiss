/**
 * Sticky Player Module
 * Event-driven architecture - listens to custom events from view.js
 * and updates UI accordingly
 */

function setImageSrcIfChanged(imageElement, nextSrc) {
	if (!imageElement || !nextSrc) return false;

	const currentSrc = imageElement.getAttribute('src') || imageElement.currentSrc || imageElement.src || '';
	if (currentSrc === nextSrc) {
		return false;
	}

	imageElement.src = nextSrc;
	return true;
}

class KisskissStickyPlayer {
	constructor() {
		this.mainAudioPlayer = null;
		this.stickyPlayerWrapper = null;
		this.currentMode = 'default';
		this.init();
	}

	init() {
		console.log('[STICKY-PLAYER] Initializing with event-driven architecture...');

		// Attach metadata/mode event listeners immediately, regardless of DOM state.
		// These listen on document and do not require player elements to exist yet.
		this.attachEventListeners();

		// Bind UI controls once DOM is ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.setup());
		} else {
			this.setup();
		}
	}

	setup() {
		this.stickyPlayerWrapper = document.getElementById('kisskiss-sticky-player-wrapper');
		this.mainAudioPlayer = document.getElementById('kisskiss-audio-player');

		if (!this.stickyPlayerWrapper) {
			console.warn('[STICKY-PLAYER] Sticky wrapper not found');
		}

		if (!this.mainAudioPlayer) {
			console.warn('[STICKY-PLAYER] Audio player element not found - play controls disabled');
			return;
		}

		// Sync initial play/pause icon state
		const isPlaying = !this.mainAudioPlayer.paused;
		this.updatePlayIcon(isPlaying);
		console.log('[STICKY-PLAYER] Initial play state:', isPlaying);

		this.attachButtonListeners();
		console.log('[STICKY-PLAYER] Button listeners attached');
	}

	attachEventListeners() {
		// Listen for play event from view.js
		document.addEventListener('kisskiss-play', () => {
			console.log('[STICKY-PLAYER] Received play event');
			this.updatePlayIcon(true);
		});

		// Listen for pause event from view.js
		document.addEventListener('kisskiss-pause', () => {
			console.log('[STICKY-PLAYER] Received pause event');
			this.updatePlayIcon(false);
		});

		// Listen for volume change from audioPlayer.js
		document.addEventListener('kisskiss-volume-change', (e) => {
			console.log('[STICKY-PLAYER] Volume change event:', e.detail.volume);
			this.updateVolume(e.detail.volume);
		});

		// ── Modalità default (radio KissKiss principale) ────────────────────
		document.addEventListener('SET_UI_MODE_DEFAULT', () => {
			console.log('[STICKY-PLAYER] Mode: default');
			this.currentMode = 'default';
			const logoUrl = (window.kisskissData?.pluginUrl || '') + 'logo.png';
			this.setBaseCover(logoUrl);
		});

		// ── Modalità non-default (altra radio selezionata) ──────────────────
		document.addEventListener('SET_UI_MODE_NOT_DEFAULT', (e) => {
			console.log('[STICKY-PLAYER] Mode: not-default', e.detail);
			this.currentMode = 'not-default';
			const selectedRadio = e.detail;
			if (selectedRadio?.img) {
				this.setBaseCover(selectedRadio.img);
			}
			if (selectedRadio?.name) {
				this.updateShowTitle(selectedRadio.name);
			}
			this.updateSongInfo('', '');
		});

		// ── Metadata radio default (sempre aggiornato, entrambe le modalità) 
		document.addEventListener('DEFAULT_RADIO_METADATA_UPDATED', (e) => {
			console.log('[STICKY-PLAYER] DEFAULT_RADIO_METADATA_UPDATED', e.detail);
			const { trackMetadati, showMetadati } = e.detail || {};

			// Titolo show sempre visibile (come uiManager)
			if (showMetadati?.title) {
				this.updateShowTitle(showMetadati.title);
			}

			if (this.currentMode === 'default') {
				// Aggiorna sempre, anche con stringa vuota, per pulire i valori precedenti
				this.updateSongInfo(trackMetadati?.artist || '', trackMetadati?.title || '');
				// Artwork traccia: se null torna al logo
				if (trackMetadati?.artwork) {
					this.setBaseCover(trackMetadati.artwork);
				} else {
					const logoUrl = (window.kisskissData?.pluginUrl || '') + 'logo.png';
					this.setBaseCover(logoUrl);
				}
				// Aggiorna src overlay programma (visibilità gestita da programsManager)
				if (showMetadati?.artwork) {
					this.setOverlayCoverSrc(showMetadati.artwork);
				}
			}
		});

		// ── Metadata radio non-default (solo info traccia) ──────────────────
		document.addEventListener('NOT_DEFAULT_RADIO_METADATA_UPDATED', (e) => {
			console.log('[STICKY-PLAYER] NOT_DEFAULT_RADIO_METADATA_UPDATED', e.detail);
			const { trackMetadati } = e.detail || {};
			if (!trackMetadati) return;
			if (this.currentMode === 'not-default') {
				this.updateSongInfo(trackMetadati.artist, trackMetadati.title);
			}
		});

		console.log('[STICKY-PLAYER] All event listeners attached');
	}

	attachButtonListeners() {
		// Desktop play/pause
		const playPauseDesktop = document.getElementById('sticky-play-pause-desktop');
		if (playPauseDesktop) {
			playPauseDesktop.addEventListener('click', () => {
				console.log('[STICKY-PLAYER] Desktop play/pause clicked');
				this.togglePlayPause();
			});
		}

		// Mobile play/pause
		const playPauseMobile = document.getElementById('sticky-play-pause-mobile');
		if (playPauseMobile) {
			playPauseMobile.addEventListener('click', () => {
				console.log('[STICKY-PLAYER] Mobile play/pause clicked');
				this.togglePlayPause();
			});
		}

		// Desktop select radio
		const selectRadioDesktop = document.getElementById('sticky-select-radio-desktop');
		if (selectRadioDesktop) {
			selectRadioDesktop.addEventListener('click', () => {
				console.log('[STICKY-PLAYER] Select radio clicked');
				this.openRadioModal();
			});
		}

		// Mobile select radio
		const selectRadioMobile = document.getElementById('sticky-select-radio-mobile');
		if (selectRadioMobile) {
			selectRadioMobile.addEventListener('click', () => {
				console.log('[STICKY-PLAYER] Select radio clicked');
				this.openRadioModal();
			});
		}

		// Desktop volume slider
		const volumeSliderDesktop = document.getElementById('sticky-volume-slider-desktop');
		if (volumeSliderDesktop) {
			volumeSliderDesktop.addEventListener('input', (e) => {
				console.log('[STICKY-PLAYER] Desktop volume slider changed:', e.target.value);
				const volume = e.target.value / 100;
				this.mainAudioPlayer.volume = volume;
				
				// Also update main player volume slider
				const mainSlider = document.querySelector('.kisskiss-volume-slider');
				if (mainSlider) {
					mainSlider.value = e.target.value;
					mainSlider.dispatchEvent(new Event('input', { bubbles: true }));
				}
			});
		}
	}

	togglePlayPause() {
		if (!this.mainAudioPlayer) return;

		if (this.mainAudioPlayer.paused) {
			this.mainAudioPlayer.play().catch(err => {
				console.error('[STICKY-PLAYER] Play error:', err);
			});
		} else {
			this.mainAudioPlayer.pause();
		}
	}

	openRadioModal() {
		const modal = document.getElementById('kisskiss-radio-modal');
		if (modal) {
			modal.classList.remove('hidden');
			document.body.style.overflow = 'hidden';
			
			// Render radio stations grid (from view.js)
			if (window.renderRadioStations && typeof window.renderRadioStations === 'function') {
				window.renderRadioStations();
				console.log('[STICKY-PLAYER] Radio stations rendered');
			} else {
				console.warn('[STICKY-PLAYER] renderRadioStations function not found');
			}
			
			console.log('[STICKY-PLAYER] Radio modal opened');
		}
	}

	updatePlayIcon(isPlaying) {
		const desktopIcon = document.getElementById('sticky-play-icon-desktop');
		const mobileIcon = document.getElementById('sticky-play-icon-mobile');
		const assetUrl = window.kisskissData?.pluginUrl || '';
		// Quando isPlaying = true (audio playing), mostra PAUSE icon
		// Quando isPlaying = false (audio paused), mostra PLAY icon
		const iconSrc = isPlaying ? assetUrl + 'pause.svg' : assetUrl + 'play.svg';

		if (desktopIcon) {
			desktopIcon.src = iconSrc;
			desktopIcon.alt = isPlaying ? 'Pause' : 'Play';
		}

		if (mobileIcon) {
			mobileIcon.src = iconSrc;
			mobileIcon.alt = isPlaying ? 'Pause' : 'Play';
		}

		console.log('[STICKY-PLAYER] Play icon updated:', isPlaying ? 'pause' : 'play');
	}

	updateVolume(volumeValue) {
		const stickySlider = document.getElementById('sticky-volume-slider-desktop');
		if (stickySlider) {
			stickySlider.value = volumeValue;
			console.log('[STICKY-PLAYER] Volume slider updated:', volumeValue);
		}
	}

	// ── Helper methods ──────────────────────────────────────────────────────

	setBaseCover(src) {
		if (!src) return;
		const desktopCover = document.getElementById('sticky-player-cover-desktop');
		const mobileCover  = document.getElementById('sticky-player-cover-mobile');
		if (desktopCover) setImageSrcIfChanged(desktopCover, src);
		if (mobileCover)  setImageSrcIfChanged(mobileCover, src);
		console.log('[STICKY-PLAYER] Base cover updated:', src);
	}

	setOverlayCoverSrc(src) {
		if (!src) return;
		const desktopOverlay = document.getElementById('sticky-program-cover-desktop');
		const mobileOverlay  = document.getElementById('sticky-program-cover-mobile');
		if (desktopOverlay) setImageSrcIfChanged(desktopOverlay, src);
		if (mobileOverlay)  setImageSrcIfChanged(mobileOverlay, src);
	}

	updateShowTitle(title) {
		const desktopTitle = document.getElementById('sticky-show-title-desktop');
		const mobileTitle  = document.getElementById('sticky-show-title-mobile');
		if (desktopTitle) desktopTitle.textContent = title || '';
		if (mobileTitle)  mobileTitle.textContent  = title || '';
	}

	updateSongInfo(artist, title) {
		const songInfoDesktop = document.getElementById('sticky-song-info-desktop');
		if (!songInfoDesktop) return;
		if (artist && title)   songInfoDesktop.textContent = `${artist} - ${title}`;
		else if (artist)       songInfoDesktop.textContent = artist;
		else if (title)        songInfoDesktop.textContent = title;
		else                   songInfoDesktop.textContent = '';
	}
}

// Initialize sticky player when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		window.kisskissStickyPlayer = new KisskissStickyPlayer();
	});
} else {
	window.kisskissStickyPlayer = new KisskissStickyPlayer();
}

console.log('[STICKY-PLAYER] Module loaded');
