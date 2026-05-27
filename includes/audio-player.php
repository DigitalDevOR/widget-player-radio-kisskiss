<?php
/**
 * Audio Player Component
 * Renders the hidden audio element for streaming
 *
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- Audio Player Element -->
<audio id="kisskiss-audio-player" auto-play crossorigin="anonymous">
	<source src="https://kisskiss.fluidstream.eu/KissKiss.aac" type="audio/aac">
	Il tuo browser non supporta l'elemento audio.
</audio>
