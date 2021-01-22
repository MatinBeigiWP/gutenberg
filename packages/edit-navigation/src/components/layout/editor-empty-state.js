/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function EditorEmptyState( { isPending } ) {
	return (
		<div>
			{ isPending && <Spinner /> }
			{ ! isPending &&
				__(
					'No menus have been created. Add a new one to get started.'
				) }
		</div>
	);
}
