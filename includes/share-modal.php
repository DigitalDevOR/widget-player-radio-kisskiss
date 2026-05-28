<?php
/**
 * Share Modal Component
 * Displays the share options modal
 *
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . 'globals.php';

?>
<!-- Modal per condivisione -->
<div id="kisskiss-share-modal" class="kisskiss-modal-overlay kisskiss-share-modal-overlay hidden">
	<div class="kisskiss-modal-container kisskiss-share-modal-container">
		<!-- Drag Handle -->
		<div class="kisskiss-drag-handle"></div>
		<!-- Modal Header -->
		<div class="kisskiss-modal-header">
		<h2>Condividi</h2>
			<button class="kisskiss-modal-close" id="kisskiss-share-modal-close">
				<?php
					echo '
						<img class="kisskiss-icon-style" src="' . esc_url( KISSKISS_ASSETS_URL . 'close.svg' ) . '" alt="Close Icon" class="kisskiss-close-icon" width="24px" />
					';
				?>
			</button>
		</div>
		<!-- Modal Content -->
		<div class="kisskiss-modal-content">
			<div id="kisskiss-share-options" class="kisskiss-share-options">
				<!-- Opzioni di condivisione caricate dinamicamente via JS -->
			</div>
		</div>
	</div>
</div>
