<?php
/**
 * Admin Menu for KissKiss Player
 * Handles admin menu registration and page rendering
 *
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kisskiss_Admin_Menu {

	/**
	 * Initialize admin menu hooks
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_scripts' ) );
	}

	/**
	 * Register admin menu and submenus
	 */
	public static function register_admin_menu() {
		// Main menu
		add_menu_page(
			'KissKiss Player',           // Page title
			'KissKiss Player',           // Menu title
			'manage_options',            // Capability
			'kisskiss-player',           // Menu slug
			array( __CLASS__, 'render_dashboard' ),
			'dashicons-headphones',      // Icon
			25                           // Position
		);

		// Submenu: Manage Radios
		add_submenu_page(
			'kisskiss-player',           // Parent slug
			'Gestisci Radio',            // Page title
			'Gestisci Radio',            // Menu title
			'manage_options',            // Capability
			'kisskiss-radios',           // Menu slug
			array( __CLASS__, 'render_manage_radios' )
		);

		// Submenu: Manage Programs
		add_submenu_page(
			'kisskiss-player',           // Parent slug
			'Programmi & Copertine',     // Page title
			'Programmi & Copertine',     // Menu title
			'manage_options',            // Capability
			'kisskiss-programs',         // Menu slug
			array( __CLASS__, 'render_manage_programs' )
		);
	}

	/**
	 * Render dashboard page
	 */
	public static function render_dashboard() {
		?>
		<div class="wrap">
			<h1>KissKiss Player - Dashboard</h1>
			<div class="kisskiss-dashboard">
				<div class="kisskiss-card">
					<h2>Benvenuto!</h2>
					<p>Gestisci le tue radio e i programmi KissKiss da qui.</p>
					<ul>
						<li><a href="?page=kisskiss-radios">Gestisci Radio</a> - Aggiungi, modifica o elimina radio</li>
						<li><a href="?page=kisskiss-programs">Programmi & Copertine</a> - Associa programmi a copertine</li>
					</ul>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render manage radios page
	 */
	public static function render_manage_radios() {
		require_once plugin_dir_path( __FILE__ ) . 'pages/page-manage-radios.php';
	}

	/**
	 * Render manage programs page
	 */
	public static function render_manage_programs() {
		require_once plugin_dir_path( __FILE__ ) . 'pages/page-manage-programs.php';
	}

	/**
	 * Enqueue admin scripts and styles
	 *
	 * @param string $hook The current admin page hook.
	 */
	public static function enqueue_admin_scripts( $hook ) {
		// Only load on our plugin pages
		if ( strpos( $hook, 'kisskiss' ) === false ) {
			return;
		}

		// Enqueue admin CSS
		wp_enqueue_style(
			'kisskiss-admin',
			plugin_dir_url( dirname( __FILE__ ) ) . 'assets/admin-style.css',
			array(),
			'1.0.0'
		);

		// Enqueue Media Uploader per upload immagini
		wp_enqueue_media();

		// Enqueue admin JavaScript
		wp_enqueue_script(
			'kisskiss-admin',
			plugin_dir_url( dirname( __FILE__ ) ) . 'assets/admin-script.js',
			array( 'jquery', 'wp-api-fetch', 'media-upload' ),
			'1.0.0',
			true
		);

		// Localize script with AJAX nonce
		wp_localize_script(
			'kisskiss-admin',
			'kisskissAdmin',
			array(
				'nonce' => wp_create_nonce( 'kisskiss_admin_nonce' ),
				'rest_url' => rest_url( 'kisskiss/v1/' ),
			)
		);
	}
}

// Initialize on plugin load
if ( is_admin() ) {
	Kisskiss_Admin_Menu::init();
}
