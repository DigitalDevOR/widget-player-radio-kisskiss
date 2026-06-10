/**
 * programsManager.js
 * Gestisce la logica di mostrare temporaneamente le copertine dei programmi
 */

let programCoverIntervalId = null;
let programCoverWindowTimeoutId = null;
let programCoverVisibilityTimeoutId = null;
let programCoverCurrentShown = false;
let lastProgramTitle = null;
let lastProgramCoverSrc = '';
let lastProgramData = null;
let currentProgramCoverState = {
	visible: false,
	coverSrc: '',
	cycleActive: false,
};

function setProgramCoverState(visible, coverSrc) {
	currentProgramCoverState = {
		visible: !!visible,
		coverSrc: coverSrc || '',
		cycleActive: currentProgramCoverState.cycleActive || false,
	};
}

function getProgramCoverElement() {
	return document.getElementById('program-cover');
}

function getMainCoverElement() {
	return document.getElementById('main-cover');
}

function getProgramCoverStickyDesktop() {
	return document.getElementById('sticky-player-cover-desktop');
}

function getProgramCoverStickyMobile() {
	return document.getElementById('sticky-player-cover-mobile');
}

function getStickyProgramCoverDesktop() {
	return document.getElementById('sticky-program-cover-desktop');
}

function getStickyProgramCoverMobile() {
	return document.getElementById('sticky-program-cover-mobile');
}

function getProgramCoverTargets() {
	return [
		getProgramCoverElement(),
		getStickyProgramCoverDesktop(),
		getStickyProgramCoverMobile(),
	].filter(Boolean);
}

function getProgramCoverHideTargets(visible) {
	if (visible) {
		return [
			getProgramCoverStickyDesktop(),
			getProgramCoverStickyMobile(),
		].filter(Boolean);
	}

	return [
		getProgramCoverElement(),
		getStickyProgramCoverDesktop(),
		getStickyProgramCoverMobile(),
	].filter(Boolean);
}

function getProgramCoverShowTargets(visible) {
	if (visible) {
		return [
			getProgramCoverElement(),
			getStickyProgramCoverDesktop(),
			getStickyProgramCoverMobile(),
		].filter(Boolean);
	}

	return [
		getProgramCoverStickyDesktop(),
		getProgramCoverStickyMobile(),
	].filter(Boolean);
}

function setCoverVisibleState(coverElement, visible) {
	if (!coverElement) return;

	coverElement.style.display = 'block';
	coverElement.style.opacity = '0';
	coverElement.style.visibility = 'visible';

	if (visible) {
		coverElement.classList.remove('is-fading-out');
		coverElement.offsetHeight;
		requestAnimationFrame(() => {
			coverElement.classList.add('is-visible');
			coverElement.style.opacity = '1';
		});
		return;
	}

	coverElement.classList.add('is-fading-out');
	coverElement.classList.remove('is-visible');
}

function setProgramCoverVisible(visible) {
	const hideTargets = getProgramCoverHideTargets(visible);
	const showTargets = getProgramCoverShowTargets(visible);
	if (!hideTargets.length && !showTargets.length) return;

	if (programCoverVisibilityTimeoutId !== null) {
		clearTimeout(programCoverVisibilityTimeoutId);
		programCoverVisibilityTimeoutId = null;
	}

	hideTargets.forEach((coverElement) => setCoverVisibleState(coverElement, false));
	showTargets.forEach((coverElement) => setCoverVisibleState(coverElement, true));

	programCoverVisibilityTimeoutId = setTimeout(() => {
		hideTargets.forEach((currentProgramCover) => {
			currentProgramCover.style.display = 'none';
			currentProgramCover.style.visibility = 'hidden';
			currentProgramCover.classList.remove('is-fading-out');
		});
	}, 500);
}

function setProgramCoverSrc(src) {
	if (!src) return;

	const targets = [
		getProgramCoverElement(),
		getStickyProgramCoverDesktop(),
		getStickyProgramCoverMobile(),
	];

	targets.forEach((el) => {
		if (!el) return;
		const currentSrc = el.getAttribute('src') || '';
		if (currentSrc !== src) {
			el.setAttribute('src', src);
		}
	});
}

function stopProgramCoverCycle(data = lastProgramData, coverSrc = lastProgramCoverSrc) {
	if (programCoverIntervalId !== null) {
		clearInterval(programCoverIntervalId);
		programCoverIntervalId = null;
	}
	if (programCoverWindowTimeoutId !== null) {
		clearTimeout(programCoverWindowTimeoutId);
		programCoverWindowTimeoutId = null;
	}
	if (programCoverVisibilityTimeoutId !== null) {
		clearTimeout(programCoverVisibilityTimeoutId);
		programCoverVisibilityTimeoutId = null;
	}
	programCoverCurrentShown = false;
	setProgramCoverVisible(false);
	// mark cycle inactive
	currentProgramCoverState.cycleActive = false;
}

function startProgramCoverCycle(data, matchingProgram) {
	stopProgramCoverCycle(data, matchingProgram.cover_url);

	const coverSrc = matchingProgram.cover_url;
	lastProgramData = data;
	setProgramCoverSrc(coverSrc);

	const show = () => {
		setProgramCoverVisible(true);
		setProgramCoverState(true, coverSrc);
		
	};

	const hide = () => {
		setProgramCoverVisible(false);
		setProgramCoverState(false, coverSrc);
		// notify sticky/main listeners that program cover is hidden
		
	};

	// Mostra subito la copertina e poi alterna ogni 3 secondi
	programCoverCurrentShown = true;
	show();

	// mark cycle active so view.js can notify sticky
	currentProgramCoverState.cycleActive = true;

	programCoverIntervalId = setInterval(() => {
		if (programCoverCurrentShown) {
			hide();
		} else {
			show();
		}
		programCoverCurrentShown = !programCoverCurrentShown;
	}, 3000);

	// Mantiene il ciclo per 20 secondi e poi, se il programma è ancora lo stesso, lo riavvia
	programCoverWindowTimeoutId = setTimeout(() => {
		const stillSameProgram = lastProgramTitle === data.show?.title;
		stopProgramCoverCycle();
		if (stillSameProgram) {
			startProgramCoverCycle(data, matchingProgram);
		}
	}, 20000);

	return true;
}

export function handleProgramTitleChange(data, radioPrograms) {
	const programTitle = data.show?.title;
	if (!programTitle) return false;

	const matchingProgram = (radioPrograms || []).find(prog => prog.title && prog.title.toLowerCase() === programTitle.toLowerCase());

	if (programTitle !== lastProgramTitle) {
		lastProgramTitle = programTitle;
		stopProgramCoverCycle();
		console.log('[PROGRAMS] Timer precedente fermato');

		if (matchingProgram && matchingProgram.cover_url) {
			console.log('[PROGRAMS] Timer avviato per il programma:', programTitle);

			if (lastProgramCoverSrc !== matchingProgram.cover_url) {
				lastProgramCoverSrc = matchingProgram.cover_url;
			}

			startProgramCoverCycle(data, matchingProgram);

			return true;
		} else {
			console.log('[PROGRAMS] Programma non trovato o senza copertina:', programTitle);
			return false;
		}
	}

	return false;
}

export function resetProgramsManager() {
	stopProgramCoverCycle();
	lastProgramTitle = null;
	lastProgramCoverSrc = '';
	currentProgramCoverState = {
		visible: false,
		coverSrc: '',
	};
}

export function getProgramCoverState() {
	return currentProgramCoverState;
}
