/**
 * audioPlayer.js
 * Inizializza l'audio player e gestisce i controlli play/pause/volume
 */

export function initializeAudioPlayer() {
	console.log("[AUDIO] Inizializzazione player audio...");

	const audioPlayer = document.getElementById("kisskiss-audio-player");
	const playPauseButtons = document.querySelectorAll("#play-pause");
	const volumeSlider = document.querySelector(".kisskiss-volume-slider");

	if (!audioPlayer) {
		console.error("[AUDIO] Elemento audio non trovato");
		return null;
	}

	audioPlayer.play().then(() => {
		console.log("[AUDIO] Player avviato con successo");
	}).catch(err => {
		console.error("[AUDIO] Errore durante play:", err);
	});

	if (playPauseButtons.length === 0) {
		console.error("[AUDIO] Pulsanti play/pause non trovati");
		return audioPlayer;
	}

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

	playPauseButtons.forEach(btn => {
		btn.addEventListener("click", function(e) {
			e.preventDefault();
			console.log("[AUDIO] Play/Pause clicked, stato attuale:", audioPlayer.paused);
			if (audioPlayer.paused) {
				const sourceElement = audioPlayer.querySelector('source');
				const currentUrl = sourceElement.src.split('?')[0];
				sourceElement.src = currentUrl + "?t=" + Date.now();
				audioPlayer.load();
				audioPlayer.play().catch(err => {
					console.error("[AUDIO] Errore durante play:", err);
				});
				// Aggiorna icona immediatamente per feedback UI
				updatePlayIcon(true);
				playPauseButtons.forEach(b => b.classList.add('playing'));
			} else {
				audioPlayer.pause();
				// Aggiorna icona immediatamente per feedback UI
				updatePlayIcon(false);
				playPauseButtons.forEach(b => b.classList.remove('playing'));
			}
		});
	});

	// Volume slider sync
	if (volumeSlider) {
		volumeSlider.addEventListener('input', (e) => {
			const val = e.target.value;
			audioPlayer.volume = val / 100;
			// Dispatch volume change for sticky
			document.dispatchEvent(new CustomEvent('kisskiss-volume-change', { detail: { volume: val } }));
		});
	}

	// Aggiorna icona quando il player cambia stato (es. play/pause esterni)
	audioPlayer.addEventListener('play', function() {
		console.log('[AUDIO] Player avviato');
		updatePlayIcon(true);
		playPauseButtons.forEach(btn => btn.classList.add('playing'));
		// Dispatch custom event per sticky player
		document.dispatchEvent(new CustomEvent('kisskiss-play'));
	});

	audioPlayer.addEventListener('pause', function() {
		console.log('[AUDIO] Player fermato');
		updatePlayIcon(false);
		playPauseButtons.forEach(btn => btn.classList.remove('playing'));
		document.dispatchEvent(new CustomEvent('kisskiss-pause'));
	});

	document.addEventListener('SET_URL_STREAMING_AUDIO', (e) => {
		console.log('audioPlayer ho intercettato il change radio', e);
		const url = e.detail;
		if (!url) return;
		const sourceElement = audioPlayer.querySelector('source');
		sourceElement.src = url + '?t=' + Date.now();
		audioPlayer.load();
		audioPlayer.play().catch(err => {
			console.error('[AUDIO] Errore durante play dopo cambio URL:', err);
		});
	});

	return audioPlayer;
}
