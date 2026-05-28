<?php
/**
 * Manage Programs & Covers Page
 * Associate KissKiss programs with cover images
 *
 * @package KisskissPlayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check permissions
if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( 'Accesso non autorizzato.' );
}

// Get radios data for dropdown
$radios_file = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'data/webradio.json';
$radios = array();
if ( file_exists( $radios_file ) ) {
	$radios = json_decode( file_get_contents( $radios_file ), true );
	if ( ! is_array( $radios ) ) {
		$radios = array();
	}
}

// Get programs data
$programs_file = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'data/kisskiss-programs.json';
$programs = array();
if ( file_exists( $programs_file ) ) {
	$programs = json_decode( file_get_contents( $programs_file ), true );
	if ( ! is_array( $programs ) ) {
		$programs = array();
	}
}

// Handle form submission
$message = '';
if ( isset( $_POST['kisskiss_program_action'] ) && check_admin_referer( 'kisskiss_program_nonce' ) ) {
	$action = sanitize_text_field( $_POST['kisskiss_program_action'] );

	if ( $action === 'add' || $action === 'edit' ) {
		$index = isset( $_POST['program_index'] ) ? intval( $_POST['program_index'] ) : -1;
		$program = array(
			'title' => sanitize_text_field( $_POST['program_title'] ),
			'cover_url' => esc_url( $_POST['program_cover_url'] ),
			'description' => sanitize_textarea_field( $_POST['program_description'] ),
			'radio_id' => intval( $_POST['program_radio_id'] ),
		);

		if ( $action === 'add' ) {
			$programs[] = $program;
			$message = '<div class="notice notice-success is-dismissible"><p>Programma aggiunto con successo!</p></div>';
		} elseif ( $action === 'edit' && $index >= 0 && $index < count( $programs ) ) {
			$programs[ $index ] = $program;
			$message = '<div class="notice notice-success is-dismissible"><p>Programma aggiornato con successo!</p></div>';
		}

		// Save to file - create if doesn't exist
		@mkdir( dirname( $programs_file ), 0755, true );
		file_put_contents( $programs_file, json_encode( $programs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
	} elseif ( $action === 'delete' ) {
		$index = intval( $_POST['program_index'] );
		if ( $index >= 0 && $index < count( $programs ) ) {
			array_splice( $programs, $index, 1 );
			file_put_contents( $programs_file, json_encode( $programs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
			$message = '<div class="notice notice-success is-dismissible"><p>Programma eliminato con successo!</p></div>';
		}
	}
}

// Check if editing
$edit_index = isset( $_GET['edit'] ) ? intval( $_GET['edit'] ) : -1;
$edit_program = ( $edit_index >= 0 && $edit_index < count( $programs ) ) ? $programs[ $edit_index ] : null;
?>

<div class="wrap kisskiss-admin-page">
	<h1>Programmi & Copertine Radiofonica</h1>
	<?php echo wp_kses_post( $message ); ?>

	<div class="kisskiss-admin-container">
		<!-- Form -->
		<div class="kisskiss-admin-form">
			<h2><?php echo $edit_program ? 'Modifica Programma' : 'Aggiungi Nuovo Programma'; ?></h2>
			<form method="POST" class="kisskiss-form">
				<?php wp_nonce_field( 'kisskiss_program_nonce' ); ?>
				<input type="hidden" name="kisskiss_program_action" value="<?php echo $edit_program ? 'edit' : 'add'; ?>">
				<?php if ( $edit_program ) : ?>
					<input type="hidden" name="program_index" value="<?php echo intval( $edit_index ); ?>">
				<?php endif; ?>

				<div class="form-group">
					<label for="program_radio_id">Radio *</label>
					<select id="program_radio_id" name="program_radio_id" required>
						<option value="">-- Seleziona una radio --</option>
						<?php foreach ( $radios as $radio_index => $radio ) : ?>
							<option value="<?php echo intval( $radio_index ); ?>" <?php echo ( $edit_program && $edit_program['radio_id'] === $radio_index ) ? 'selected' : ''; ?>>
								<?php echo esc_html( $radio['name'] ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</div>

				<div class="form-group">
					<label for="program_title">Titolo Programma *</label>
					<input type="text" id="program_title" name="program_title" required value="<?php echo $edit_program ? esc_attr( $edit_program['title'] ) : ''; ?>" placeholder="Es: Marco Ferrero">
				</div>


				<div class="form-group">
					<label for="program_cover_url">URL Copertina *</label>
				<div class="media-upload-container">
					<input type="url" id="program_cover_url" name="program_cover_url" required value="<?php echo $edit_program ? esc_attr( $edit_program['cover_url'] ) : ''; ?>" placeholder="https://...">
					<button type="button" class="button" onclick="openMediaUploader('program_cover_url')">📁 Carica da Libreria</button>
				</div>
				<?php if ( $edit_program && $edit_program['cover_url'] ) : ?>
					<div style="margin-top: 10px;">
					<?php endif; ?>
				</div>

				<div class="form-group">
					<label for="program_description">Descrizione</label>
					<textarea id="program_description" name="program_description" rows="4" placeholder="Descrizione del programma..."><?php echo $edit_program ? esc_textarea( $edit_program['description'] ) : ''; ?></textarea>
				</div>

				<div class="form-actions">
					<button type="submit" class="button button-primary">
						<?php echo $edit_program ? 'Aggiorna Programma' : 'Aggiungi Programma'; ?>
					</button>
					<?php if ( $edit_program ) : ?>
						<a href="?page=kisskiss-programs" class="button">Annulla</a>
					<?php endif; ?>
				</div>
			</form>
		</div>

		<!-- Programs List -->
		<div class="kisskiss-admin-list">
			<h2>Programmi Presenti</h2>
			
			<?php if ( ! empty( $radios ) ) : ?>
				<div class="radio-filter-container">
					<label for="filter-radio">Filtra per Radio:</label>
					<select id="filter-radio" onchange="filterProgramsByRadio(this.value)">
						<option value="">-- Mostra Tutti --</option>
						<?php foreach ( $radios as $radio_index => $radio ) : ?>
							<option value="<?php echo intval( $radio_index ); ?>">
								<?php echo esc_html( $radio['name'] ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</div>
			<?php endif; ?>
			
			<?php if ( ! empty( $programs ) ) : ?>
				<div class="kisskiss-programs-grid">
					<?php foreach ( $programs as $index => $program ) : 
						$radio_name = isset( $radios[ $program['radio_id'] ] ) ? $radios[ $program['radio_id'] ]['name'] : 'Radio non trovata';
						?>
						<div class="kisskiss-program-card" data-radio-id="<?php echo intval( $program['radio_id'] ); ?>">
							<img src="<?php echo esc_attr( $program['cover_url'] ); ?>" alt="<?php echo esc_attr( $program['title'] ); ?>" class="program-cover">
							<div class="program-info">
								<h3><?php echo esc_html( $program['title'] ); ?></h3>
								<p class="program-radio"><strong><?php echo esc_html( $radio_name ); ?></strong></p>
								<p class="program-description"><?php echo esc_html( substr( $program['description'], 0, 60 ) . ( strlen( $program['description'] ) > 60 ? '...' : '' ) ); ?></p>
								<div class="program-actions">
									<a href="?page=kisskiss-programs&edit=<?php echo intval( $index ); ?>" class="button button-small">Modifica</a>
									<form method="POST" style="display:inline;">
										<?php wp_nonce_field( 'kisskiss_program_nonce' ); ?>
										<input type="hidden" name="kisskiss_program_action" value="delete">
										<input type="hidden" name="program_index" value="<?php echo intval( $index ); ?>">
										<button type="submit" class="button button-small button-link-delete" onclick="return confirm('Sei sicuro di voler eliminare questo programma?');">Elimina</button>
									</form>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			<?php else : ?>
				<p>Nessun programma trovato. <a href="">Aggiungine uno!</a></p>
			<?php endif; ?>
		</div>
	</div>
</div>

<style>
.kisskiss-admin-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	margin-top: 20px;
}

.kisskiss-admin-form {
	background: #fff;
	padding: 20px;
	border: 1px solid #ccc;
	border-radius: 5px;
	box-shadow: 0 1px 1px rgba(0,0,0,.04);
}

.kisskiss-admin-list {
	background: #fff;
	padding: 20px;
	border: 1px solid #ccc;
	border-radius: 5px;
	box-shadow: 0 1px 1px rgba(0,0,0,.04);
}

.form-group {
	margin-bottom: 15px;
}

.form-group label {
	display: block;
	margin-bottom: 5px;
	font-weight: 600;
}

.form-group input,
.form-group textarea {
	width: 100%;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
	box-sizing: border-box;
	font-family: inherit;
}

.form-group select {
	width: 100%;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
	box-sizing: border-box;
	font-family: inherit;
}

.form-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
}

.radio-filter-container {
	margin-bottom: 20px;
	padding: 12px;
	background: #f0f0f0;
	border-radius: 4px;
	display: flex;
	align-items: center;
	gap: 10px;
}

.radio-filter-container label {
	font-weight: 600;
	margin: 0;
}

.radio-filter-container select {
	padding: 6px 10px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.media-upload-container {
	display: flex;
	gap: 10px;
	align-items: center;
	margin-bottom: 10px;
}

.media-upload-container input {
	flex: 1;
}

.media-upload-container button {
	white-space: nowrap;
	padding: 8px 12px !important;
	height: 36px;
}

.kisskiss-programs-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 15px;
}

.kisskiss-program-card {
	background: #f9f9f9;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	overflow: hidden;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kisskiss-program-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.program-cover {
	width: 100%;
	height: 200px;
	object-fit: cover;
}

.program-info {
	padding: 12px;
}

.program-info h3 {
	margin: 0 0 8px 0;
	font-size: 14px;
}

.program-radio {
	margin: 0 0 6px 0;
	font-size: 12px;
	color: #0073aa;
}

.program-time {
	margin: 0 0 8px 0;
	font-size: 12px;
	color: #666;
}

.program-description {
	margin: 0 0 10px 0;
	font-size: 12px;
	color: #888;
	line-height: 1.4;
}

.program-actions {
	display: flex;
	gap: 5px;
}

.program-actions button,
.program-actions a {
	font-size: 11px !important;
	padding: 4px 8px !important;
}

@media (max-width: 768px) {
	.kisskiss-admin-container {
		grid-template-columns: 1fr;
	}
	
	.kisskiss-programs-grid {
		grid-template-columns: 1fr;
	}
}
</style>

<script>
function openMediaUploader(inputId) {
	var mediaUploader;
	if (mediaUploader) {
		mediaUploader.open();
		return;
	}
	
	mediaUploader = wp.media.frames.file_frame = wp.media({
		title: 'Seleziona Immagine',
		button: {
			text: 'Seleziona'
		},
		multiple: false
	});
	
	mediaUploader.on('select', function() {
		var attachment = mediaUploader.state().get('selection').first().toJSON();
		document.getElementById(inputId).value = attachment.url;
	});
	
	mediaUploader.open();
}

function filterProgramsByRadio(radioId) {
	const cards = document.querySelectorAll('.kisskiss-program-card');
	cards.forEach(card => {
		if (radioId === '' || card.dataset.radioId === radioId) {
			card.style.display = '';
		} else {
			card.style.display = 'none';
		}
	});
}
</script>
