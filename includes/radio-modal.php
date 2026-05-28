<?php
/**
 * Radio Selection Modal Component
 * Displays the radio station selection modal
 *
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . 'globals.php';

?>
<!-- Modal per selezione radio -->
<div id="kisskiss-radio-modal" class="kisskiss-modal-overlay hidden">
	<div class="kisskiss-modal-container">
		<!-- Drag Handle -->
		<div class="kisskiss-drag-handle"></div>
		<!-- Modal Header -->
		<div class="kisskiss-modal-header">
			<h2>Seleziona Radio</h2>
			<button class="kisskiss-modal-close" id="kisskiss-modal-close">
				<?php
					echo '
						<img class="kisskiss-icon-style" src="' . esc_url( KISSKISS_ASSETS_URL . 'close.svg' ) . '" alt="Close Icon" class="kisskiss-close-icon" width="24px" />
					';
				?>
			</button>
		</div>
		<!-- Modal Content -->
		<div class="kisskiss-modal-content">
			<div id="kisskiss-stations-grid" class="kisskiss-stations-grid">
				<!-- Stazioni caricate dinamicamente via JS -->
			</div>
		</div>
		<!-- Modal Footer -->
		<div class="kisskiss-modal-footer">
			<button class="kisskiss-btn-cancel" id="kisskiss-modal-cancel">Annulla</button>
			<button class="kisskiss-btn-confirm" id="kisskiss-modal-confirm">Conferma</button>
		</div>
	</div>
</div>
