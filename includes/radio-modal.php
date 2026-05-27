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
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
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
