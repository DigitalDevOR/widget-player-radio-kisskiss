import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';

export default function Edit() {
	return (
		<div { ...useBlockProps() } className="wp-block-kisskiss-player-editor">
			<div className="bg-white p-8 rounded-lg border-2 border-blue-300">
				<h2 className="text-2xl font-bold text-blue-600 mb-4">
					{ __( 'Widget Player Radio Kisskiss', 'widget-player-radio-kisskiss' ) }
				</h2>
				
				<div className="bg-blue-50 p-6 rounded-lg">
					<p className="text-gray-700 mb-4">
						{ __( 'Anteprima del Player Radio Kiss Kiss', 'widget-player-radio-kisskiss' ) }
					</p>
					
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Cover Art Preview */}
						<div className="aspect-square bg-gray-300 rounded-lg flex items-center justify-center">
							<span className="text-gray-500 text-center">
								{ __( 'Album Cover', 'widget-player-radio-kisskiss' ) }
							</span>
						</div>
						
						{/* Info Preview */}
						<div className="flex flex-col justify-center">
							<div className="mb-4">
								<div className="flex items-center gap-2 mb-3">
									<div className="w-2 h-2 bg-red-600 rounded-full"></div>
									<span className="font-bold text-sm text-blue-600">
										{ __( 'IN ONDA ORA', 'widget-player-radio-kisskiss' ) }
									</span>
								</div>
								<span className="text-gray-600 text-sm">
									{ __( 'Good Morning Kiss Kiss', 'widget-player-radio-kisskiss' ) }
								</span>
							</div>
							
							<h1 className="text-4xl font-bold text-blue-600 mb-2">
								{ __( 'Stellaris', 'widget-player-radio-kisskiss' ) }
							</h1>
							<h2 className="text-xl text-blue-400 mb-6">
								{ __( 'Neon Dreams', 'widget-player-radio-kisskiss' ) }
							</h2>
							
							<div className="flex gap-4">
								<button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700">
									{ __( 'Play', 'widget-player-radio-kisskiss' ) }
								</button>
								<button className="bg-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-400">
									{ __( 'Share', 'widget-player-radio-kisskiss' ) }
								</button>
							</div>
						</div>
					</div>
				</div>
				
				<p className="text-sm text-gray-500 mt-6 italic">
					{ __( 'Il player sarà completamente interattivo nel frontend', 'widget-player-radio-kisskiss' ) }
				</p>
			</div>
		</div>
	);
}
