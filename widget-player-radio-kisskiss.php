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
 * Registra lo shortcode [kisskiss-player]
 * Utilizzo: [kisskiss-player]
 * Pixel perfect render dal mockup HTML
 */
function widget_player_radio_kisskiss_shortcode( $atts ) {
	$plugin_url = plugin_dir_url( __FILE__ ) . 'assets/';

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

	// Genera l'HTML pixel perfect dal mockup
	ob_start();
	?>
	<!-- Audio Player Element -->
	<audio id="kisskiss-audio-player" auto-play crossorigin="anonymous">
		<source src="https://kisskiss.fluidstream.eu/KissKiss.aac" type="audio/aac">
		Il tuo browser non supporta l'elemento audio.
	</audio>

	<div class="wp-block-kisskiss-player">
		<!-- Main Content: Live Stream Player -->
		<main class="kisskiss-player-main">
			<div class="kisskiss-player-container">
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
							<p id="overlay-current-program-title">Current program: Night Drive Sessions</p>
						</div>
					</div>

					<!-- Floating Decorative Element 
					<div class="kisskiss-badge">
						<span class="kisskiss-badge-icon">🎵</span>
						<span class="kisskiss-badge-text">PREMIUM AUDIO</span>
					</div>
					-->
				</div>

				<!-- Right: Info & Controls -->
				<div class="kisskiss-info">
					<div class="kisskiss-live-indicator">
						<div class="kisskiss-live-status">
							<div class="kisskiss-live-dot"></div>
							<span class="kisskiss-live-text">In Onda Ora</span>
						</div>
						<div class="kisskiss-program">
							<span id="program-title" class="kisskiss-program-name">Radio Kiss Kiss - Play everywhere!</span>
							<span id="program-time" class="kisskiss-program-time"></span>
							<span id="song-artist" class="kisskiss-song-artis-mobile"></span>
						</div>
					</div>

					<div class="kisskiss-titles">
						<h1 id="song-title" class="kisskiss-artist"></h1>
						<h2 id="song-artist-2" class="kisskiss-song"></h2>
					</div>

					<div class="kisskiss-divider hide-on-mobile"></div>

					<!-- Minimalist Controls -->
					<div class="kisskiss-controls">
						<div class="kisskiss-controls-row">
							<button class="kisskiss-btn kisskiss-btn-primary hide-on-mobile" id="select-radio-btn">								
								<?php
									echo '
										<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'radio.svg' ) . '" alt="Select Radio Icon" class="kisskiss-radio-icon" />
									';
								?>
								</span>
								<span>Seleziona Radio</span>
							</button>
							<button class="kisskiss-btn kisskiss-btn-play hide-on-mobile" id="play-pause">								
								<?php
									echo '
										<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'play.svg' ) . '" alt="Play Icon" class="kisskiss-play-icon-img" />
									';
								?>								
							</button>
							<div class="kisskiss-mobile-radio-play">
								<button class="kisskiss-btn-primary-mobile" id="select-radio-btn">								
									<?php
										echo '
											<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'radio-blue.svg' ) . '" alt="Select Radio Icon" class="kisskiss-radio-icon" />
										';
									?>								
									<span class="kisskiss-btn-primary-mobile-text">SELEZIONA RADIO</span>
								</button>
								<div class="kisskiss-mobile-play-share">
									<button class="kisskiss-btn kisskiss-btn-play" id="play-pause">
									
										<?php
											echo '
												<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'play.svg' ) . '" alt="Play Icon" class="kisskiss-play-icon-img" />
											';
										?>
									
									</button>
									<button style="background:none !important" class="kisskiss-btn kisskiss-btn-share" id="share-btn">
									
										<?php
											echo '
												<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'share.svg' ) . '" alt="Share Icon" class="kisskiss-share-icon-img" />
											';
										?>
									
									</button>
								</div>							
							</div>
							<button style="background:none !important" class="kisskiss-btn kisskiss-btn-share hide-on-mobile" id="share-btn-desktop">							
								<?php
									echo '
										<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'share.svg' ) . '" alt="Share Icon" class="kisskiss-share-icon-img" />
									';
								?>								
							</button>
						</div>

						<div class="kisskiss-volume hide-on-mobile">
							<span class="kisskiss-volume-icon">
								<?php
									echo '
										<img class="kisskiss-icon-style" src="' . esc_url( $plugin_url . 'volume.svg' ) . '" alt="Volume Icon" class="kisskiss-volume-icon-img" />
									';
								?>
							</span>
							<input
								class="kisskiss-volume-slider"
								max="100"
								min="0"
								type="range"
								value="80"
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'kisskiss-player', 'widget_player_radio_kisskiss_shortcode' );
