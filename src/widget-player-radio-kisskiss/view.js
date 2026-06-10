/*
	event dispatched in this fcode:

	DEFAUL_RADIO_METADATA_UPDATED', {
		trackMetadati: trackMetadati,
		showMetadati: showMetadati
	}


*/


import webradioData from '../../data/webradio.json';
import { initializeRadioModal } from './modalManager';
import { initializeAudioPlayer } from './audioPlayer';
import { initializeUiManager } from './uiManager';
import { loadRadioPrograms } from './stationLoader';

const POLLING_TIME_ITERATION = 5000;
var defaultRadioPollingResult = {};
var notDefaultRadioPollingResult = {};
var notDefaultRadioFlag = false;
var selectedWebRadio = {};
var selectedStreamAudioUrl = '';
var radioPrograms = [];

function setDefaultPlayerUi() {
	// Attiva modalità default: mostra cover show/traccia alternata ogni 5s con logo KissKiss
	document.dispatchEvent(new CustomEvent('SET_UI_MODE_DEFAULT'));

	const defaultRadio = getDefaultRadio();
	const pollingUrl = getApiPollingUrlOfRadio(defaultRadio);

	fetchUrl(pollingUrl).then(data => {
		if (data) {
			console.log('[startDeafaultRadioPolling] initial fetch', data);
			assignAndDispatchDefaultRadioMetaDatas(data);
		}
	});
}

function setNotDefaultPlayerUi(selectedRadio) {
	// Attiva modalità non-default: mostra CTA con dati polling default + non-default
	document.dispatchEvent(new CustomEvent('SET_UI_MODE_NOT_DEFAULT', { detail: notDefaultRadioPollingResult }));
	const pollingUrl = selectedRadio.pollingApiEndpoint;

	fetchUrl(pollingUrl).then(data => {
		if (data) {
			console.log('[startDeafaultRadioPolling] initial fetch', data);
			assignAndDispatchNotDefaultRadioMetaDatas(data);
		}
	});


}

function setPlayerOndefault() {
	//set player su stream default
	const defaultRadio = getDefaultRadio();
	selectedStreamAudioUrl = defaultRadio.url;
	document.dispatchEvent( new CustomEvent('SET_URL_STREAMING_AUDIO', {detail: selectedStreamAudioUrl}))
	setDefaultPlayerUi();
}

function setPlayerOnNotDefaultRadio(selectedRadio) {
	selectedStreamAudioUrl = selectedRadio.url;
	document.dispatchEvent( new CustomEvent('SET_URL_STREAMING_AUDIO', {detail: selectedStreamAudioUrl}))
	setNotDefaultPlayerUi(selectedRadio);
}
//INDIPENDENT FUNCTION IT CAN RUN IN EVERY MOMENT AND IT HAVE TO WORK EVERYTIME
function getRadioList() {
	return webradioData;
}

//return object ora false
function getDefaultRadio() {
	const webradios = getRadioList();
	let result = false;

	for (const radio of webradios) {
		if (radio?.default === true) {
			result = radio;
			break;
		}
	}

	return result;
}

//return string if ok or bool false, accept in input radio object
function getApiPollingUrlOfRadio(radio) {
	if (radio?.pollingApiEndpoint) {
		return radio.pollingApiEndpoint;
	}
	return false;
}

//get show image cover if is in kisskiss-programs.json
function getShowCoverImageUrl(showName, programs) {
	if (Array.isArray(programs)) {
		for (const program of programs) {
			if (program.title.toUpperCase() === showName.toUpperCase()) {
				return program.cover_url;
			}
		}
	}
	return false;
}

//return json response or false
async function fetchUrl(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching URL:', error);
		return false;
	}
}

//take metadati in input parse and dispatch them with a custom event 
function assignAndDispatchDefaultRadioMetaDatas (data) {
	let trackMetadati = data.trackInfo;
	let showMetadati = data.show;

	//Recupero url della cover dello how in corso e lo assegno a showMetadati
	if(showMetadati) {
		const showName = showMetadati.title;
		const showCoverImageUrl = getShowCoverImageUrl(showName, radioPrograms);
		if(showCoverImageUrl) {
			showMetadati.artwork = showCoverImageUrl;
		}	
	}

	if (data !== defaultRadioPollingResult) {
		defaultRadioPollingResult = data;
		document.dispatchEvent( new CustomEvent('DEFAULT_RADIO_METADATA_UPDATED', {
			detail: { trackMetadati, showMetadati }
		}) )
	}
}

function assignAndDispatchNotDefaultRadioMetaDatas (data){
	const trackMetadati = data.trackInfo;

	document.dispatchEvent( new CustomEvent('NOT_DEFAULT_RADIO_METADATA_UPDATED', {
		detail: { trackMetadati }
	}) )
}

//every POLLING_TIME_ITERATION run fetchUrl() and then assignAndDispatchDefaultRadioMetaDatas()
function startDeafaultRadioPolling() {
	const defaultRadio = getDefaultRadio();
	const pollingUrl = getApiPollingUrlOfRadio(defaultRadio);

	if (defaultRadio && pollingUrl) {
		// Fetch immediato al caricamento per non aspettare il primo intervallo
		fetchUrl(pollingUrl).then(data => {
			if (data) {
				console.log('[startDeafaultRadioPolling] initial fetch', data);
				assignAndDispatchDefaultRadioMetaDatas(data);
			}
		});

		setInterval(async () => {
			const data = await fetchUrl(pollingUrl);
			if (data) console.log('[startDeafaultRadioPolling]', data);
			assignAndDispatchDefaultRadioMetaDatas(data)
		}, POLLING_TIME_ITERATION);
	}

	return false;
}

var notDefaultRadioPollingInterval = null;

function startWebRadioPolling(radio) {
	if (notDefaultRadioPollingInterval !== null) {
		clearInterval(notDefaultRadioPollingInterval);
		notDefaultRadioPollingInterval = null;
	}

	const pollingUrl = getApiPollingUrlOfRadio(radio);
	if (!radio || !pollingUrl) return false;

	notDefaultRadioPollingInterval = setInterval(async () => {
		const data = await fetchUrl(pollingUrl);
		if (data) assignAndDispatchNotDefaultRadioMetaDatas(data);
	}, POLLING_TIME_ITERATION);

	return true;
}

//open webRadiosModal
function openWebRadiosModal() {
	document.dispatchEvent(new CustomEvent('OPEN_RADIOS_MODAL'));
}

//close webRadiosModal
function closeWebRadiosModal() {
	document.dispatchEvent(new CustomEvent('CLOSE_RADIOS_MODAL'));
}

function manageChangedRadio(selectedRadio) {
	console.log('[view manageChangedRadio selectedRadio]', selectedRadio);
	if(!selectedRadio.default){
		//aggiorno notDefaultRadioPollingResult
		notDefaultRadioPollingResult = selectedRadio;
		setPlayerOnNotDefaultRadio(selectedRadio);
		startWebRadioPolling(selectedRadio);
	} else {
		//setto il player audio su default
		if (notDefaultRadioPollingInterval !== null) {
			clearInterval(notDefaultRadioPollingInterval);
			notDefaultRadioPollingInterval = null;
		}
		setPlayerOndefault();
	}
	return null;
}

function customEventsListener() {
	console.log('[customEventListeners], loading events litener')
	document.addEventListener('RADIO_SELECTED_EVENT', (e) => {
		const radio = e.detail;
		manageChangedRadio(radio);
	});
}

addEventListener('DOMContentLoaded', async () => {
	const pluginUrl = window.kisskissData?.pluginUrl || '';
	const programs = await loadRadioPrograms(pluginUrl);
	radioPrograms = programs;
	console.log('[initializing initializeAudioPlayer]', initializeAudioPlayer());
	console.log('[view, setPlayerOndefault]', setPlayerOndefault());
	console.log('[view, getRadioList]', getRadioList());
	console.log('[view, getDefaultRadio]', getDefaultRadio());
	console.log('[view getApiPollingUrlOfRadio]', getApiPollingUrlOfRadio(getDefaultRadio()));
	console.log('[view startDeafaultRadioPolling]', startDeafaultRadioPolling());
	console.log('[view customEventsListener]', customEventsListener());
	initializeUiManager(programs);
	initializeRadioModal(getRadioList());
})