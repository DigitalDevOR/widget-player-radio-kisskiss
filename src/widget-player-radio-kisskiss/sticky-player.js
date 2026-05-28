/**
 * Sticky Player Module
 * Event-driven architecture - listens to custom events from view.js
 * and updates UI accordingly
 */

class KisskissStickyPlayer {
	constructor() {
		this.mainAudioPlayer = null;
		this.stickyPlayerWrapper = null;
		this.init();
	}

	init() {
		console.log('[STICKY-PLAYER] Initializing with event-driven architecture...');

		// Wait for DOM to be ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.setup());
		} else {
			this.setup();
		}
	}

	setup() {
		this.stickyPlayerWrapper = document.getElementById('kisskiss-sticky-player-wrapper');
		this.mainAudioPlayer = document.getElementById('kisskiss-audio-player');

		if (!this.stickyPlayerWrapper || !this.mainAudioPlayer) {
			console.error('[STICKY-PLAYER] Required elements not found');
			return;
		}

		// Sync initial play/pause icon state
		if (this.mainAudioPlayer) {
			const isPlaying = !this.mainAudioPlayer.paused;
			this.updatePlayIcon(isPlaying);
			console.log('[STICKY-PLAYER] Initial play state:', isPlaying);
		}

		this.attachEventListeners();
		console.log('[STICKY-PLAYER] Event listeners attached');
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

		// Listen for volume change from view.js
		document.addEventListener('kisskiss-volume-change', (e) => {
			console.log('[STICKY-PLAYER] Volume change event:', e.detail.volume);
			this.updateVolume(e.detail.volume);
		});

		// Listen for metadata update from view.js
		document.addEventListener('kisskiss-metadata-update', (e) => {
			console.log('[STICKY-PLAYER] Metadata update event:', e.detail.data);
			this.updateMetadata(e.detail.data);
		});

		// Attach local button listeners
		this.attachButtonListeners();

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

	updateMetadata(data) {
		// Update covers
		let coverSrc = data.trackInfo?.artwork;
		if (!coverSrc || coverSrc.trim().toLowerCase() === 'null') {
			// Fallback to station logo if no artwork
			const defaultStationLogo = window.kisskissData?.pluginUrl + 'logo.png';
			coverSrc = defaultStationLogo;
		}

		const desktopCover = document.getElementById('sticky-player-cover-desktop');
		const mobileCover = document.getElementById('sticky-player-cover-mobile');
		
		if (desktopCover) desktopCover.src = coverSrc;
		if (mobileCover) mobileCover.src = coverSrc;

		// Update show title
		const showTitle = data.show?.title || 'Loading...';
		const desktopTitle = document.getElementById('sticky-show-title-desktop');
		const mobileTitle = document.getElementById('sticky-show-title-mobile');
		
		if (desktopTitle) desktopTitle.textContent = showTitle;
		if (mobileTitle) mobileTitle.textContent = showTitle;

		// Update song info
		const songTitle = data.trackInfo?.title || '';
		const artistName = data.trackInfo?.artist || '';
		const songInfo = songTitle && artistName ? `${songTitle} - ${artistName}` : (songTitle || artistName || '-');
		
		const desktopSongInfo = document.getElementById('sticky-song-info-desktop');
		if (desktopSongInfo) desktopSongInfo.textContent = songInfo;

		console.log('[STICKY-PLAYER] Metadata updated:', { showTitle, songInfo, cover: coverSrc });
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
