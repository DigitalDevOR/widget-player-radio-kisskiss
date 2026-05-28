/**
 * programsManager.js
 * Gestisce la logica di mostrare temporaneamente le copertine dei programmi
 */

let programCoverIntervalId = null;
let programCoverWindowTimeoutId = null;
let programCoverCurrentShown = false;
let lastProgramTitle = null;
let lastProgramCoverSrc = '';
let currentProgramCoverState = {
	visible: false,
	coverSrc: '',
};

function setProgramCoverState(visible, coverSrc) {
	currentProgramCoverState = {
		visible: !!visible,
		coverSrc: coverSrc || '',
	};
}

function getProgramCoverElement() {
	return document.getElementById('program-cover');
}

function setProgramCoverVisible(visible) {
	const programCover = getProgramCoverElement();
	if (!programCover) return;
	programCover.classList.toggle('is-visible', visible);
}

function setProgramCoverSrc(src) {
	const programCover = getProgramCoverElement();
	if (!programCover || !src) return;
	const currentSrc = programCover.getAttribute('src') || '';
	if (currentSrc !== src) {
		programCover.setAttribute('src', src);
	}
}

function stopProgramCoverCycle() {
	if (programCoverIntervalId !== null) {
		clearInterval(programCoverIntervalId);
		programCoverIntervalId = null;
	}
	if (programCoverWindowTimeoutId !== null) {
		clearTimeout(programCoverWindowTimeoutId);
		programCoverWindowTimeoutId = null;
	}
	programCoverCurrentShown = false;
	setProgramCoverVisible(false);
}

function startProgramCoverCycle(data, matchingProgram) {
	stopProgramCoverCycle();

	const coverSrc = matchingProgram.cover_url;
	setProgramCoverSrc(coverSrc);

	const show = () => {
		setProgramCoverVisible(true);
		setProgramCoverState(true, coverSrc);
	};

	const hide = () => {
		setProgramCoverVisible(false);
		setProgramCoverState(false, coverSrc);
	};

	// Mostra subito la copertina e poi alterna ogni 3 secondi
	programCoverCurrentShown = true;
	show();

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
