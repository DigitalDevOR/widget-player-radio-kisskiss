<?php
/**
 * Global Configuration Constants
 * 
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'KISSKISS_ASSETS_URL' ) ) {
	define( 'KISSKISS_ASSETS_URL', plugin_dir_url( __FILE__ ) . '../assets/' );
}
?>