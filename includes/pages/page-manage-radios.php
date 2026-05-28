<?php
/**
 * Manage Radios Page
 * CRUD operations for webradio.json
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

// Get the radios data
$radios_file = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'data/webradio.json';
$radios = array();
if ( file_exists( $radios_file ) ) {
	$radios = json_decode( file_get_contents( $radios_file ), true );
	if ( ! is_array( $radios ) ) {
		$radios = array();
	}
}

// Handle form submission
$message = '';
if ( isset( $_POST['kisskiss_action'] ) && check_admin_referer( 'kisskiss_radio_nonce' ) ) {
	$action = sanitize_text_field( $_POST['kisskiss_action'] );

	if ( $action === 'add' || $action === 'edit' ) {
		$index = isset( $_POST['radio_index'] ) ? intval( $_POST['radio_index'] ) : -1;
		
		// Se questo radio è impostato come default, rimuovi il default da tutti gli altri
		$is_default = isset( $_POST['radio_default'] ) && $_POST['radio_default'] === 'on';
		if ( $is_default ) {
			foreach ( $radios as &$radio ) {
				$radio['default'] = false;
			}
		}
		
		$radio = array(
			'name' => sanitize_text_field( $_POST['radio_name'] ),
			'img'  => esc_url( $_POST['radio_img'] ),
			'url'  => esc_url( $_POST['radio_url'] ),
			'pollingApiEndpoint' => esc_url( $_POST['radio_polling_endpoint'] ?? '' ),
			'default' => $is_default,
		);

		if ( $action === 'add' ) {
			$radios[] = $radio;
			$message = '<div class="notice notice-success is-dismissible"><p>Radio aggiunta con successo!</p></div>';
		} elseif ( $action === 'edit' && $index >= 0 && $index < count( $radios ) ) {
			$radios[ $index ] = $radio;
			$message = '<div class="notice notice-success is-dismissible"><p>Radio aggiornata con successo!</p></div>';
		}

		// Save to file
		@mkdir( dirname( $radios_file ), 0755, true );
		file_put_contents( $radios_file, json_encode( $radios, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
	} elseif ( $action === 'delete' ) {
		$index = intval( $_POST['radio_index'] );
		if ( $index >= 0 && $index < count( $radios ) ) {
			array_splice( $radios, $index, 1 );
			@mkdir( dirname( $radios_file ), 0755, true );
			file_put_contents( $radios_file, json_encode( $radios, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
			$message = '<div class="notice notice-success is-dismissible"><p>Radio eliminata con successo!</p></div>';
		}
	}
}

// Check if editing
$edit_index = isset( $_GET['edit'] ) ? intval( $_GET['edit'] ) : -1;
$edit_radio = ( $edit_index >= 0 && $edit_index < count( $radios ) ) ? $radios[ $edit_index ] : null;
?>

<div class="wrap kisskiss-admin-page">
	<h1>Gestisci Radio</h1>
	<?php echo wp_kses_post( $message ); ?>

	<div class="kisskiss-admin-container">
		<!-- Form -->
		<div class="kisskiss-admin-form">
			<h2><?php echo $edit_radio ? 'Modifica Radio' : 'Aggiungi Nuova Radio'; ?></h2>
			<form method="POST" class="kisskiss-form">
				<?php wp_nonce_field( 'kisskiss_radio_nonce' ); ?>
				<input type="hidden" name="kisskiss_action" value="<?php echo $edit_radio ? 'edit' : 'add'; ?>">
				<?php if ( $edit_radio ) : ?>
					<input type="hidden" name="radio_index" value="<?php echo intval( $edit_index ); ?>">
				<?php endif; ?>

				<div class="form-group">
					<label for="radio_name">Nome Radio *</label>
					<input type="text" id="radio_name" name="radio_name" required value="<?php echo $edit_radio ? esc_attr( $edit_radio['name'] ) : ''; ?>">
				</div>

				<div class="form-group">
					<label for="radio_img">URL Immagine/Logo *</label>
					<input type="url" id="radio_img" name="radio_img" required value="<?php echo $edit_radio ? esc_attr( $edit_radio['img'] ) : ''; ?>">
				<button type="button" class="button" onclick="openMediaUploader('radio_img')">Carica da Libreria</button>
				<small>URL dell'immagine della radio</small>
				<?php if ( $edit_radio && $edit_radio['img'] ) : ?>
					<div style="margin-top: 10px;">
						<img src="<?php echo esc_attr( $edit_radio['img'] ); ?>" alt="Logo Radio" style="max-width: 150px; height: auto; border-radius: 5px;">
					</div>
				<?php endif; ?>
					<label for="radio_url">URL Stream Audio *</label>
					<input type="url" id="radio_url" name="radio_url" required value="<?php echo $edit_radio ? esc_attr( $edit_radio['url'] ) : ''; ?>">
					<small>URL dello stream audio (es: .aac, .mp3)</small>
				</div>
			<div class="form-group">
				<label for="radio_polling_endpoint">Endpoint Polling (opzionale)</label>
				<input type="url" id="radio_polling_endpoint" name="radio_polling_endpoint" value="<?php echo $edit_radio ? esc_attr( $edit_radio['pollingApiEndpoint'] ?? '' ) : ''; ?>">
				<small>URL endpoint per recuperare metadati in tempo reale</small>
			</div>

			<div class="form-group checkbox-group">
				<label>
					<input type="checkbox" id="radio_default" name="radio_default" <?php echo ( $edit_radio && $edit_radio['default'] ) ? 'checked' : ''; ?>>
					<span>Imposta come Radio di Default</span>
				</label>
				<small>Solo una radio può essere di default. Selezionarla qui la imposterà automaticamente come predefinita.</small>
			</div>
				<div class="form-actions">
					<button type="submit" class="button button-primary">
						<?php echo $edit_radio ? 'Aggiorna Radio' : 'Aggiungi Radio'; ?>
					</button>
					<?php if ( $edit_radio ) : ?>
						<a href="?page=kisskiss-radios" class="button">Annulla</a>
					<?php endif; ?>
				</div>
			</form>
		</div>

		<!-- Radios List -->
		<div class="kisskiss-admin-list">
			<h2>Radios Presenti</h2>
			<?php if ( ! empty( $radios ) ) : ?>
				<table class="wp-list-table widefat striped">
					<thead>
						<tr>
							<th>Nome</th>
							<th>Logo</th>
							<th>Endpoint Polling</th>
							<th>Default</th>
							<th>Azioni</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $radios as $index => $radio ) : ?>
							<tr>
								<td><strong><?php echo esc_html( $radio['name'] ); ?></strong></td>
								<td>
									<img src="<?php echo esc_attr( $radio['img'] ); ?>" alt="<?php echo esc_attr( $radio['name'] ); ?>" style="max-width: 80px; height: auto;">
								</td>
								<td><small><?php echo ( $radio['pollingApiEndpoint'] ?? '' ) ? esc_html( substr( $radio['pollingApiEndpoint'], 0, 40 ) . '...' ) : '<em>No endpoint</em>'; ?></small></td>
								<td>
									<?php if ( $radio['default'] ) : ?>
										<span class="badge badge-default">⭐ Default</span>
									<?php endif; ?>
								</td>
								<td>
									<a href="?page=kisskiss-radios&edit=<?php echo intval( $index ); ?>" class="button button-small">Modifica</a>
									<form method="POST" style="display:inline;">
										<?php wp_nonce_field( 'kisskiss_radio_nonce' ); ?>
										<input type="hidden" name="kisskiss_action" value="delete">
										<input type="hidden" name="radio_index" value="<?php echo intval( $index ); ?>">
										<button type="submit" class="button button-small button-link-delete" onclick="return confirm('Sei sicuro di voler eliminare questa radio?');">Elimina</button>
									</form>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php else : ?>
				<p>Nessuna radio trovata. <a href="">Aggiungine una!</a></p>
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

.form-group input {
	width: 100%;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
	box-sizing: border-box;
}

.form-group small {
	display: block;
	margin-top: 4px;
	color: #666;
	font-size: 12px;
}

.checkbox-group label {
	display: flex;
	align-items: center;
	gap: 8px;
}

.checkbox-group input[type="checkbox"] {
	width: auto;
	margin: 0;
}

.checkbox-group span {
	font-weight: 600;
}

.badge-default {
	display: inline-block;
	background: #ffd700;
	color: #333;
	padding: 4px 8px;
	border-radius: 3px;
	font-size: 12px;
	font-weight: 600;
}

.form-actions {
	display: flex;
	gap: 10px;
	margin-top: 20px;
}

@media (max-width: 768px) {
	.kisskiss-admin-container {
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
</script>
