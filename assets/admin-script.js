/**
 * Admin JavaScript for KissKiss Player
 * Handles AJAX operations and interactions
 */

(function ($) {
	'use strict';

	const KisskissAdmin = {
		init: function () {
			this.bindEvents();
			console.log('[KISSKISS-ADMIN] Initialized');
		},

		bindEvents: function () {
			// Add any event listeners here
			this.initMediaUploader();
		},

		/**
		 * Initialize WordPress media uploader
		 */
		initMediaUploader: function () {
			if (typeof wp === 'undefined' || !wp.media) {
				console.warn('[KISSKISS-ADMIN] WordPress media library not available');
				return;
			}

			$(document).on('click', '[onclick*="openMediaUploader"]', function (e) {
				e.preventDefault();
				KisskissAdmin.openMediaUploader();
			});
		},

		/**
		 * Open WordPress media uploader
		 */
		openMediaUploader: function () {
			if (!window.kisskissMediaUploader) {
				window.kisskissMediaUploader = wp.media({
					title: 'Seleziona Immagine',
					button: {
						text: 'Seleziona'
					},
					multiple: false,
					library: {
						type: 'image'
					}
				});
			}

			window.kisskissMediaUploader.on('select', function () {
				const attachment = window.kisskissMediaUploader
					.state()
					.get('selection')
					.first()
					.toJSON();

				// Update the URL field
				const urlField = document.getElementById('program_cover_url');
				if (urlField) {
					urlField.value = attachment.url;
				}

				// Show preview
				KisskissAdmin.updatePreview(attachment.url);
			});

			window.kisskissMediaUploader.open();
		},

		/**
		 * Update image preview
		 */
		updatePreview: function (url) {
			let preview = document.querySelector('.program-cover-preview');
			if (!preview) {
				const formGroup = document.getElementById('program_cover_url').parentNode;
				preview = document.createElement('div');
				preview.className = 'program-cover-preview';
				preview.style.marginTop = '10px';
				formGroup.appendChild(preview);
			}

			preview.innerHTML =
				'<img src="' +
				url +
				'" alt="Preview" style="max-width: 150px; height: auto; border-radius: 5px;">';
		},

		/**
		 * AJAX call for deleting data
		 */
		deleteItem: function (endpoint, id) {
			if (!confirm('Sei sicuro di voler eliminare questo elemento?')) {
				return;
			}

			wp.apiFetch({
				path: `/kisskiss/v1/${endpoint}/${id}`,
				method: 'DELETE',
			})
				.then((response) => {
					console.log('[KISSKISS-ADMIN] Item deleted:', response);
					location.reload();
				})
				.catch((error) => {
					console.error('[KISSKISS-ADMIN] Delete error:', error);
					alert('Errore durante l\'eliminazione: ' + error.message);
				});
		},

		/**
		 * AJAX call for saving data
		 */
		saveItem: function (endpoint, data) {
			wp.apiFetch({
				path: `/kisskiss/v1/${endpoint}`,
				method: 'POST',
				data: data,
			})
				.then((response) => {
					console.log('[KISSKISS-ADMIN] Item saved:', response);
					location.reload();
				})
				.catch((error) => {
					console.error('[KISSKISS-ADMIN] Save error:', error);
					alert('Errore durante il salvataggio: ' + error.message);
				});
		},
	};

	// Initialize on document ready
	$(document).ready(function () {
		KisskissAdmin.init();
	});

	// Export to window for external use
	window.KisskissAdmin = KisskissAdmin;
})(jQuery);
