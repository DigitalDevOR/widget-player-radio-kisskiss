<?php
/**
 * Plugin Name:       Widget Player Radio Kisskiss
 * Description:       Example block scaffolded with Create Block tool.
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       widget-player-radio-kisskiss
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Carica le costanti globali
require_once plugin_dir_path( __FILE__ ) . 'includes/globals.php';

// Carica il menu amministrativo
require_once plugin_dir_path( __FILE__ ) . 'includes/class-admin-menu.php';

/**
 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
 * based on the registered block metadata. Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function create_block_widget_player_radio_kisskiss_block_init() {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
}
add_action( 'init', 'create_block_widget_player_radio_kisskiss_block_init' );

/**
 * Enqueue volume control script
 */
function enqueue_kisskiss_volume_control() {
	wp_enqueue_script(
		'kisskiss-volume-control',
		plugin_dir_url( __FILE__ ) . 'src/widget-player-radio-kisskiss/volume-control.js',
		[],
		'1.0',
		true
	);
}
add_action( 'wp_enqueue_scripts', 'enqueue_kisskiss_volume_control' );

/**
 * Enqueue share control script
 */
function enqueue_kisskiss_share_control() {
	wp_enqueue_script(
		'kisskiss-share-control',
		plugin_dir_url( __FILE__ ) . 'src/widget-player-radio-kisskiss/share-control.js',
		[],
		'1.0',
		true
	);
}
add_action( 'wp_enqueue_scripts', 'enqueue_kisskiss_share_control' );

/**
 * Enqueue sticky player script
 */
function enqueue_kisskiss_sticky_player() {
	wp_enqueue_script(
		'kisskiss-sticky-player',
		plugin_dir_url( __FILE__ ) . 'src/widget-player-radio-kisskiss/sticky-player.js',
		[],
		'1.0',
		true
	);
}
add_action( 'wp_enqueue_scripts', 'enqueue_kisskiss_sticky_player' );

/**
 * Registra lo shortcode [kisskiss-player]
 * Utilizzo: [kisskiss-player]
 * Pixel perfect render dal mockup HTML
 */
function widget_player_radio_kisskiss_shortcode( $atts ) {
	$plugin_url = KISSKISS_ASSETS_URL;

	// Enqueue view.js
	wp_enqueue_script(
		'widget-player-radio-kisskiss-view',
		plugin_dir_url( __FILE__ ) . 'build/widget-player-radio-kisskiss/view.js',
		[],
		filemtime( plugin_dir_path( __FILE__ ) . 'build/widget-player-radio-kisskiss/view.js' ),
		true
	);

	// Passa i dati a view.js tramite wp_localize_script
	wp_localize_script(
		'widget-player-radio-kisskiss-view',
		'kisskissData',
		[
			'pluginUrl' => $plugin_url,
			'blockId'   => 'kisskiss-player-' . uniqid(),
		]
	);

	wp_enqueue_style( 'create-block-widget-player-radio-kisskiss-style' );

	// Enqueue sticky player CSS
	wp_enqueue_style(
		'kisskiss-sticky-player-style',
		plugin_dir_url( __FILE__ ) . 'src/widget-player-radio-kisskiss/sticky-player.css',
		[],
		filemtime( plugin_dir_path( __FILE__ ) . 'src/widget-player-radio-kisskiss/sticky-player.css' )
	);

	// Genera l'HTML pixel perfect dal mockup
	ob_start();
	?>
	<?php include plugin_dir_path( __FILE__ ) . 'includes/audio-player.php'; ?>

	<div class="wp-block-kisskiss-player">
		<!-- Main Content: Live Stream Player -->
		<main class="kisskiss-player-main">
			<div class="kisskiss-player-container">
				<?php include plugin_dir_path( __FILE__ ) . 'includes/cover-section.php'; ?>
				<?php include plugin_dir_path( __FILE__ ) . 'includes/info-section.php'; ?>
			</div>
		</main>
	</div>

	<?php include plugin_dir_path( __FILE__ ) . 'includes/sticky-player.php'; ?>
	<?php include plugin_dir_path( __FILE__ ) . 'includes/radio-modal.php'; ?>
	<?php include plugin_dir_path( __FILE__ ) . 'includes/share-modal.php'; ?>
	<?php
	return ob_get_clean();
}
add_shortcode( 'kisskiss-player', 'widget_player_radio_kisskiss_shortcode' );
