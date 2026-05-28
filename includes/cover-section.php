<?php
/**
 * Cover Section Component
 * Displays the album cover art with overlay
 *
 * @package KisskissPlayer
 * @param string $plugin_url URL base dei plugin assets
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! isset( $plugin_url ) ) {
	return;
}
?>
<!-- Left: Cover Art / Album Image -->
<div class="kisskiss-cover-container">
	<div class="kisskiss-cover-inner">
		<img
			alt="copertina canzone"
			class="kisskiss-cover-img"
			id="main-cover"
			src="<?php echo esc_url( $plugin_url . 'logo.png' ); ?>"
		/>
		<!-- Content Overlay for dynamic cycling mention -->
		<div class="kisskiss-cover-overlay">
			<p id="overlay-current-program-title"></p>
		</div>
	</div>
</div>
