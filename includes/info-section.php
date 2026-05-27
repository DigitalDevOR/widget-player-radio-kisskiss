<?php
/**
 * Info Section Component
 * Displays live indicator, song info and player controls
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
