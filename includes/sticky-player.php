<?php
/**
 * Sticky Player Component
 * Displays a minimal player bar at the bottom when main player is not visible
 *
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . 'globals.php';

?>
<!-- Sticky Player (Always visible for debugging) -->
<div id="kisskiss-sticky-player-wrapper">
	<!-- Desktop Version -->
	<section id="kisskiss-sticky-player-desktop">
		<div class="kisskiss-sticky-player-desktop__container">
			<!-- Left: Brand & Metadata -->
			<div class="kisskiss-sticky-player-desktop__left">
				<div class="kisskiss-sticky-player-desktop__cover">
					<img
						id="sticky-player-cover-desktop"
						alt="Album Cover"
						src=""
					/>
					<img
						id="sticky-program-cover-desktop"
						alt="Program Cover"
						aria-hidden="true"
						src=""
					/>
					<div class="kisskiss-sticky-player-desktop__live-dot hidden" id="sticky-live-dot-desktop"></div>
				</div>
				<div class="kisskiss-sticky-player-desktop__metadata">
					<div class="kisskiss-sticky-player-desktop__meta-top">
						<span class="kisskiss-sticky-player-desktop__live-label hidden" id="sticky-live-label-desktop">Live</span>
						<h3 id="sticky-show-title-desktop" class="kisskiss-sticky-player-desktop__show-title">Loading...</h3>
					</div>
					<p id="sticky-song-info-desktop" class="kisskiss-sticky-player-desktop__song-info">-</p>
				</div>
			</div>

			<!-- Center: Primary Controls -->
			<div class="kisskiss-sticky-player-desktop__center">
				<button id="sticky-play-pause-desktop" class="kisskiss-sticky-player-desktop__play-btn">
					<img id="sticky-play-icon-desktop" class="kisskiss-sticky-player-desktop__play-icon" src="<?php echo esc_url( KISSKISS_ASSETS_URL . 'pause.svg' ); ?>" alt="Play" />
				</button>
			</div>

			<!-- Right: Secondary Actions -->
			<div class="kisskiss-sticky-player-desktop__right">
				<button id="sticky-select-radio-desktop" class="kisskiss-btn kisskiss-btn-primary">
					<?php
						echo '
							<img class="kisskiss-icon-style" src="' . esc_url( KISSKISS_ASSETS_URL . 'radio.svg' ) . '" alt="Select Radio Icon" class="kisskiss-radio-icon" />
						';
					?>
					<span>Seleziona Radio</span>
				</button>
				<div class="kisskiss-sticky-player-desktop__volume-controls">
					<button id="sticky-volume-icon-desktop" class="kisskiss-sticky-player-desktop__volume-icon">
						<img src="<?php echo esc_url( KISSKISS_ASSETS_URL . 'volume.svg' ); ?>" alt="Volume" />
					</button>
					<input id="sticky-volume-slider-desktop" aria-label="Volume Slider" class="kisskiss-sticky-player-desktop__volume-slider" max="100" min="0" type="range" value="80" />
				</div>
			</div>
		</div>
	</section>

	<!-- Mobile Version -->
	<section id="kisskiss-sticky-player-mobile">
		<div class="kisskiss-sticky-player-mobile__container">
			<div class="kisskiss-sticky-player-mobile__content">
				<!-- Left Section: Artwork & Info -->
				<div class="kisskiss-sticky-player-mobile__left">
					<div class="kisskiss-sticky-player-mobile__cover">
						<img
							id="sticky-player-cover-mobile"
							src=""
							alt="Album Cover"
						/>
						<img
							id="sticky-program-cover-mobile"
							aria-hidden="true"
							src=""
							alt="Program Cover"
						/>
						<div class="kisskiss-sticky-player-mobile__live-dot hidden" id="sticky-live-dot-mobile"></div>
					</div>
					<div class="kisskiss-sticky-player-mobile__metadata">
						<span class="kisskiss-sticky-player-mobile__live-label hidden" id="sticky-live-label-mobile">NOW PLAYING</span>
						<h2 id="sticky-show-title-mobile" class="kisskiss-sticky-player-mobile__show-title">Loading...</h2>
					</div>
				</div>

				<!-- Right Section: Controls -->
				<div class="kisskiss-sticky-player-mobile__right">
					<button id="sticky-select-radio-mobile" class="kisskiss-sticky-player-mobile__select-radio">
						<img class="kisskiss-sticky-player-mobile__select-radio-icon" src="<?php echo esc_url( KISSKISS_ASSETS_URL . 'radio.svg' ); ?>" alt="Radio" />
						<span class="kisskiss-sticky-player-mobile__select-radio-text">Radio</span>
					</button>
					<button id="sticky-play-pause-mobile" class="kisskiss-sticky-player-mobile__play-btn">
						<img id="sticky-play-icon-mobile" class="kisskiss-sticky-player-mobile__play-icon" src="<?php echo esc_url( KISSKISS_ASSETS_URL . 'pause.svg' ); ?>" alt="Play" />
					</button>
				</div>
			</div>
		</div>
	</section>
</div>

