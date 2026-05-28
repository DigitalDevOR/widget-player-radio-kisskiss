/**
 * pollingManager.js
 * Gestisce polling multipli per endpoint diversi
 */

const pollInterval = 7000; // Intervallo di polling in millisecondi (7 secondi)

export const pollingManager = {
	activePollings: {}, // { endpointUrl: { intervalId, retryCount, lastData } }
	maxRetries: 3,

	start(endpoint, onData) {
		if (!endpoint) {
			console.log('[POLLING-MANAGER] Endpoint vuoto, polling non avviato');
			return;
		}

		if (this.activePollings[endpoint]) {
			console.log('[POLLING-MANAGER] Polling già attivo per:', endpoint);
			return;
		}

		console.log('[POLLING-MANAGER] Avvio polling per:', endpoint);

		const polling = {
			retryCount: 0,
			lastData: null,
		};

		const fetchData = async () => {
			try {
				const url = new URL(endpoint);
				url.searchParams.append('t', Date.now());

				const response = await fetch(url.toString(), {
					method: 'GET',
					headers: {
						'Cache-Control': 'no-cache, no-store, must-revalidate',
						Pragma: 'no-cache',
						Expires: '0',
					},
					cache: 'no-store',
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				polling.retryCount = 0;
				const data = await response.json();

				if (JSON.stringify(data) !== JSON.stringify(polling.lastData)) {
					console.log('[POLLING-MANAGER] Dati aggiornati da:', endpoint);
					polling.lastData = data;
					onData(data);
				}
			} catch (error) {
				console.error('[POLLING-MANAGER] Errore polling:', endpoint, error);
				polling.retryCount++;

				if (polling.retryCount >= this.maxRetries) {
					console.warn('[POLLING-MANAGER] Max retries raggiunto per:', endpoint);
					this.stop(endpoint);
				}
			}
		};

		fetchData();

		polling.intervalId = setInterval(fetchData, pollInterval);
		this.activePollings[endpoint] = polling;

		console.log('[POLLING-MANAGER] Polling avviato con intervallo:', pollInterval);
	},

	stop(endpoint) {
		if (!this.activePollings[endpoint]) {
			console.log('[POLLING-MANAGER] Polling non trovato per:', endpoint);
			return;
		}

		clearInterval(this.activePollings[endpoint].intervalId);
		delete this.activePollings[endpoint];
		console.log('[POLLING-MANAGER] Polling fermato per:', endpoint);
	},

	stopAllExcept(keepEndpoint) {
		for (const endpoint in this.activePollings) {
			if (endpoint !== keepEndpoint) {
				this.stop(endpoint);
			}
		}
	},

	stopAll() {
		for (const endpoint in this.activePollings) {
			this.stop(endpoint);
		}
	},
};
