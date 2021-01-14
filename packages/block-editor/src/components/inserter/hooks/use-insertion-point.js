/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { _n } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../../store';

/**
 * @typedef WPInserterConfig
 *
 * @property {string=}   rootClientId        If set, insertion will be into the
 *                                           block with this ID.
 * @property {number=}   insertionIndex      If set, insertion will be into this
 *                                           explicit position.
 * @property {string=}   clientId            If set, insertion will be after the
 *                                           block with this ID.
 * @property {boolean=}  isAppender          Whether the inserter is an appender
 *                                           or not.
 * @property {Function=} onSelect            Called after insertion.
 */

/**
 * Returns the insertion point state given the inserter config.
 *
 * @param {WPInserterConfig} config Inserter Config.
 * @return {Array} Insertion Point State (rootClientID, onInsertBlocks and onToggle).
 */
function useInsertionPoint( {
	rootClientId,
	insertionIndex,
	clientId,
	isAppender,
	onSelect,
} ) {
	const {
		selectedBlock,
		destinationRootClientId,
		destinationIndex,
	} = useSelect(
		( select ) => {
			const {
				getSelectedBlock,
				getBlockIndex,
				getBlockOrder,
				getBlockInsertionPoint,
			} = select( blockEditorStore );

			let _destinationRootClientId, _destinationIndex;

			if ( rootClientId || insertionIndex || clientId || isAppender ) {
				// If any of these arguments are set, we're in "manual mode"
				// meaning the insertion point is set by the caller.

				_destinationRootClientId = rootClientId;

				if ( insertionIndex ) {
					// Insert into a specific index.
					_destinationIndex = insertionIndex;
				} else if ( clientId ) {
					// Insert after a specific client ID.
					_destinationIndex = getBlockIndex(
						clientId,
						_destinationRootClientId
					);
				} else {
					// Insert at the end of the list.
					_destinationIndex = getBlockOrder(
						_destinationRootClientId
					).length;
				}
			} else {
				// Otherwise, we're in "auto mode" where the insertion point is
				// decided by getBlockInsertionPoint().
				const insertionPoint = getBlockInsertionPoint();
				_destinationRootClientId = insertionPoint.rootClientId;
				_destinationIndex = insertionPoint.index;
			}

			return {
				selectedBlock: getSelectedBlock(),
				destinationRootClientId: _destinationRootClientId,
				destinationIndex: _destinationIndex,
			};
		},
		[ rootClientId, insertionIndex, clientId, isAppender ]
	);

	const {
		replaceBlocks,
		insertBlocks,
		showInsertionPoint,
		hideInsertionPoint,
	} = useDispatch( blockEditorStore );

	const onInsertBlocks = useCallback(
		( blocks, meta ) => {
			if (
				! isAppender &&
				selectedBlock &&
				isUnmodifiedDefaultBlock( selectedBlock )
			) {
				replaceBlocks(
					selectedBlock.clientId,
					blocks,
					null,
					undefined,
					meta
				);
			} else {
				insertBlocks(
					blocks,
					destinationIndex,
					destinationRootClientId,
					false,
					meta
				);
			}

			// translators: %d: the name of the block that has been added
			const message = _n(
				'%d block added.',
				'%d blocks added.',
				blocks.length
			);
			speak( message );

			if ( onSelect ) {
				onSelect();
			}
		},
		[
			isAppender,
			selectedBlock,
			replaceBlocks,
			insertBlocks,
			destinationRootClientId,
			destinationIndex,
			onSelect,
		]
	);

	const onToggleInsertionPoint = useCallback(
		( show ) => {
			if ( show ) {
				showInsertionPoint( destinationRootClientId, destinationIndex );
			} else {
				hideInsertionPoint();
			}
		},
		[
			showInsertionPoint,
			hideInsertionPoint,
			destinationRootClientId,
			destinationIndex,
		]
	);

	return [ destinationRootClientId, onInsertBlocks, onToggleInsertionPoint ];
}

export default useInsertionPoint;
