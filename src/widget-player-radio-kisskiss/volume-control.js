/**
 * Volume Control Script con Web Audio API
 * Gestisce il controllo del volume della scheda/audio
 */

document.addEventListener('DOMContentLoaded', function() {
  // Seleziona elementi
  let audio = document.querySelector('audio');
  const volumeSlider = document.querySelector('.kisskiss-volume-slider');
  const volumeIcons = document.querySelectorAll('.kisskiss-volume-icon');

  if (!volumeSlider) return;

  // Web Audio API
  let audioContext;
  let gainNode;
  let source;

  // Inizializza Web Audio API
  function initAudioContext() {
    if (audioContext) return; // Evita re-inizializzazione

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // Se esiste un tag audio, collegalo
    if (audio) {
      source = audioContext.createMediaElementAudioSource(audio);
      source.connect(gainNode);
    }

    console.log('Web Audio API inizializzata');
  }

  // Imposta volume default a 80
  volumeSlider.value = 80;

  // Imposta volume iniziale
  if (audio) {
    audio.volume = 0.8;
  }

  // Evento: cambia volume quando sposti lo slider
  volumeSlider.addEventListener('input', function() {
    const volumeValue = this.value; // 0-100
    const normalizedVolume = volumeValue / 100; // 0-1

    // Inizializza AudioContext al primo interazione
    if (!audioContext) {
      initAudioContext();
    }

    // Applica volume con Web Audio API
    if (gainNode) {
      gainNode.gain.value = normalizedVolume;
    }

    // Fallback: applica anche su tag audio se esiste
    if (audio) {
      audio.volume = normalizedVolume;
    }

    // Cambia icone volume
    updateVolumeIcon(volumeValue);

    // Espone il volume globalmente
    window.kisskissVolume = normalizedVolume;

    console.log(`Volume: ${volumeValue}% (${normalizedVolume.toFixed(2)})`);
  });

  // Funzione per cambiare icona volume
  function updateVolumeIcon(value) {
    if (value == 0) {
      volumeIcons[0].textContent = '🔇';
    } else if (value < 50) {
      volumeIcons[0].textContent = '🔉';
    } else {
      volumeIcons[0].textContent = '🔊';
    }
  }

  // Controlla volume con tasti freccia
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') {
      volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
      volumeSlider.dispatchEvent(new Event('input'));
    }
    if (e.key === 'ArrowDown') {
      volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
      volumeSlider.dispatchEvent(new Event('input'));
    }
  });

  // Espone API globale
  window.kisskissAudio = {
    setVolume: function(percentage) {
      volumeSlider.value = Math.max(0, Math.min(100, percentage));
      volumeSlider.dispatchEvent(new Event('input'));
    },
    getVolume: function() {
      return parseInt(volumeSlider.value);
    },
    getAudioContext: function() {
      if (!audioContext) initAudioContext();
      return audioContext;
    },
    getGainNode: function() {
      return gainNode;
    }
  };

  console.log('Volume Control pronto. Usa window.kisskissAudio per il controllo');
});
