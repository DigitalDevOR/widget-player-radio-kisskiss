/**
 * modalManager.js
 * Funzioni per gestire il radio modal e renderizzare le stazioni
 */

export function initializeRadioModal(radioStations) {
	const modal = document.getElementById('kisskiss-radio-modal');
	const openButtons = document.querySelectorAll('#select-radio-btn');
	const closeButton = document.getElementById('kisskiss-modal-close');
	const cancelButton = document.getElementById('kisskiss-modal-cancel');
	const confirmButton = document.getElementById('kisskiss-modal-confirm');
	const stationsGrid = document.getElementById('kisskiss-stations-grid');
	const modalContainer = modal ? modal.querySelector('.kisskiss-modal-container') : null;
	const dragHandle = modal ? modal.querySelector('.kisskiss-drag-handle') : null;

	if (!modal || !stationsGrid) return;

	// Precarica le immagini in cache del browser (array mantiene i riferimenti in memoria)
	const preloadedImages = radioStations
		.filter(station => station.img)
		.map(station => {
			const img = new Image();
			img.src = station.img;
			return img;
		});

	let activeStationIndex = radioStations.findIndex(r => r.default === true);
	let selectedStationIndex = activeStationIndex;
	let touchStartY = 0;
	let touchCurrentY = 0;
	let isDragging = false;
	const dragThreshold = 100;

	function resetModalPosition() {
		if (!modalContainer) return;
		modalContainer.style.transform = 'translateY(0)';
		modalContainer.style.transition = '';
	}

	function closeModal() {
		modal.classList.add('hidden');
		document.body.style.overflow = '';
		selectedStationIndex = activeStationIndex;
		isDragging = false;
		resetModalPosition();
	}

	window.renderRadioStations = function() {
		stationsGrid.innerHTML = '';
		radioStations.forEach((station, index) => {
			const card = document.createElement('div');
			card.className = `kisskiss-station-card ${index === selectedStationIndex ? 'active' : ''}`;
			let logoSrc = station.img && station.img.trim() ? station.img : window.kisskissData.pluginUrl + 'logo.png';
			const playIcon = window.kisskissData.pluginUrl + 'play.svg';
			card.innerHTML = `
				<div class="kisskiss-station-logo">
					<img src="${logoSrc}" alt="${station.name}">
				</div>
				<div class="kisskiss-station-info">
					<h3>${station.name}</h3>
				</div>
				<div class="kisskiss-station-check">
					<img src="${playIcon}" alt="Play" class="kisskiss-play-icon">
				</div>
			`;

			card.addEventListener('click', () => {
				document.querySelectorAll('.kisskiss-station-card').forEach(c => c.classList.remove('active'));
				card.classList.add('active');
				selectedStationIndex = index;
			});

			stationsGrid.appendChild(card);
		});
	};

	openButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			modal.classList.remove('hidden');
			document.body.style.overflow = 'hidden';
			resetModalPosition();
			window.renderRadioStations();
		});
	});

	closeButton.addEventListener('click', closeModal);
	cancelButton.addEventListener('click', closeModal);
	modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

	// Drag to dismiss per mobile
	if (dragHandle) {
		dragHandle.addEventListener('touchstart', (e) => {
			touchStartY = e.touches[0].clientY;
			isDragging = true;
		}, false);
	}

	if (modalContainer) {
		modalContainer.addEventListener('touchmove', (e) => {
			if (!isDragging) return;
			touchCurrentY = e.touches[0].clientY;
			const drag = touchCurrentY - touchStartY;

			if (drag > 0) {
				e.preventDefault();
				modalContainer.style.transform = `translateY(${drag}px)`;
				modalContainer.style.transition = 'none';
			}
		}, { passive: false });

		modalContainer.addEventListener('touchend', () => {
			if (!isDragging) return;
			isDragging = false;

			const drag = touchCurrentY - touchStartY;
			modalContainer.style.transition = 'transform 0.3s ease';

			if (drag > dragThreshold) {
				modalContainer.style.transform = 'translateY(100%)';
				setTimeout(() => closeModal(), 300);
			} else {
				modalContainer.style.transform = 'translateY(0)';
				setTimeout(() => {
					modalContainer.style.transition = 'none';
				}, 300);
			}
		}, false);
	}

	confirmButton.addEventListener('click', () => {
		if (selectedStationIndex !== null) {
			activeStationIndex = selectedStationIndex;
			const selectedRadio = radioStations[selectedStationIndex];
			console.log('[RADIO_SELECTED_EVENT]', selectedRadio);
			document.dispatchEvent(new CustomEvent('RADIO_SELECTED_EVENT', { detail: selectedRadio }));
			closeModal();
		}
	});
}
