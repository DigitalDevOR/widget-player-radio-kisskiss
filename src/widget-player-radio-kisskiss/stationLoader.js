/**
 * stationLoader.js
 * Contiene funzioni per caricare stazioni e programmi dai file JSON
 */

export async function loadRadioStations(pluginUrl) {
	try {
		const pluginPath = pluginUrl.replace(/\/assets\/$/, '');
		const response = await fetch(pluginPath + '/data/webradio.json');
		if (!response.ok) {
			console.error("[RADIO] Errore caricamento JSON:", response.status);
			return { stations: [], defaultIndex: 0 };
		}
		const stations = await response.json();
		const mapped = stations.map((station, index) => ({
			id: index,
			name: station.name,
			description: '',
			logo: station.img,
			url: station.url,
			pollingApiEndpoint: station.pollingApiEndpoint || '',
			isActive: station.default || false,
		}));

		let defaultIndex = mapped.findIndex(s => s.isActive);
		if (defaultIndex === -1) {
			defaultIndex = 0;
			if (mapped[0]) mapped[0].isActive = true;
			console.warn('[RADIO] Nessuna stazione con default: true trovata, uso index 0');
		}

		console.log('[RADIO] Stazioni caricate:', mapped.length, 'defaultIndex:', defaultIndex);
		return { stations: mapped, defaultIndex };
	} catch (error) {
		console.error('[RADIO] Errore caricamento stazioni:', error);
		return { stations: [], defaultIndex: 0 };
	}
}

export async function loadRadioPrograms(pluginUrl) {
	try {
		const pluginPath = pluginUrl.replace(/\/assets\/$/, '');
		const response = await fetch(pluginPath + '/data/kisskiss-programs.json');
		if (!response.ok) {
			console.log('[PROGRAMS] File programmi non trovato');
			return [];
		}
		const programs = await response.json();
		if (Array.isArray(programs)) {
			console.log('[PROGRAMS] Programmi caricati:', programs.length);
			return programs;
		}
		return [];
	} catch (error) {
		console.log('[PROGRAMS] Errore caricamento programmi:', error);
		return [];
	}
}
