import { useBlockProps } from '@wordpress/block-editor';

export default function save() {
	return (
		<div { ...useBlockProps.save() } className="wp-block-kisskiss-player">
			
		</div>
	);
}
