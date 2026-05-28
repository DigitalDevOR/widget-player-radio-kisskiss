/**
 * modalManager.js
 * Funzioni per gestire il radio modal e renderizzare le stazioni
 */

export function initializeRadioModal(getRadioStations, onSelectStation) {
	const modal = document.getElementById('kisskiss-radio-modal');
	const openButtons = document.querySelectorAll('#select-radio-btn');
	const closeButton = document.getElementById('kisskiss-modal-close');
	const cancelButton = document.getElementById('kisskiss-modal-cancel');
	const confirmButton = document.getElementById('kisskiss-modal-confirm');
	const stationsGrid = document.getElementById('kisskiss-stations-grid');
	const modalContainer = modal ? modal.querySelector('.kisskiss-modal-container') : null;
	const dragHandle = modal ? modal.querySelector('.kisskiss-drag-handle') : null;

	if (!modal || !stationsGrid) return;

	let selectedStationIndex = null;
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
		selectedStationIndex = null;
		isDragging = false;
		resetModalPosition();
	}

	window.renderRadioStations = function() {
		const radioStations = getRadioStations();
		stationsGrid.innerHTML = '';
		radioStations.forEach((station, index) => {
			const card = document.createElement('div');
			card.className = `kisskiss-station-card ${station.isActive ? 'active' : ''}`;
			let logoSrc = station.logo && station.logo.trim() ? station.logo : window.kisskissData.pluginUrl + 'logo.png';
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
				document.querySelectorAll('.kisskiss-station-card').forEach(c => c.classList.remove('active'));
				card.classList.add('active');
				selectedStationIndex = index;
			});

			stationsGrid.appendChild(card);
		});
		console.log('[RADIO] Station grid renderizzato:', radioStations.length, 'stazioni');
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
	console.log('[RADIO-DRAG] Drag handle trovato:', !!dragHandle, '[RADIO-DRAG] Modal container trovato:', !!modalContainer);

	if (dragHandle) {
		dragHandle.addEventListener('touchstart', (e) => {
			touchStartY = e.touches[0].clientY;
			isDragging = true;
			console.log('[RADIO-DRAG] Touch start:', touchStartY);
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
			onSelectStation(selectedStationIndex);
			closeModal();
		}
	});
}
