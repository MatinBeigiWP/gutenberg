/**
 * WordPress dependencies
 */
import {
	DropZoneProvider,
	Popover,
	SlotFillProvider,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import EmptyState from './empty-state';
import useNavigationEditor from './use-navigation-editor';
import useNavigationBlockEditor from './use-navigation-block-editor';
import useMenuNotifications from './use-menu-notifications';
import ErrorBoundary from '../error-boundary';
import NavigationEditorShortcuts from './shortcuts';
import Header from '../header';
import Notices from '../notices';
import Toolbar from '../toolbar';
import Editor from '../editor';
import InspectorAdditions from '../inspector-additions';
import { store as editNavigationStore } from '../../store';

export default function Layout( { blockEditorSettings } ) {
	const { saveNavigationPost } = useDispatch( editNavigationStore );
	const savePost = () => saveNavigationPost( navigationPost );

	const {
		menus,
		hasLoadedMenus,
		hasFinishedInitialLoad,
		selectedMenuId,
		navigationPost,
		selectMenu,
		deleteMenu,
	} = useNavigationEditor();

	const [ blocks, onInput, onChange ] = useNavigationBlockEditor(
		navigationPost
	);

	useMenuNotifications( selectedMenuId );

	return (
		<ErrorBoundary>
			<SlotFillProvider>
				<DropZoneProvider>
					<BlockEditorKeyboardShortcuts.Register />
					<NavigationEditorShortcuts.Register />

					<Notices />

					<div className="edit-navigation-layout">
						<Header
							isPending={ ! hasLoadedMenus }
							menus={ menus }
							selectedMenuId={ selectedMenuId }
							onSelectMenu={ selectMenu }
						/>

						{ ! menus?.length && (
							<EmptyState
								isPending={ ! hasFinishedInitialLoad }
							/>
						) }

						{ ( menus?.length || navigationPost ) && (
							<BlockEditorProvider
								value={ blocks }
								onInput={ onInput }
								onChange={ onChange }
								settings={ {
									...blockEditorSettings,
									templateLock: 'all',
									hasFixedToolbar: true,
								} }
								useSubRegistry={ false }
							>
								<BlockEditorKeyboardShortcuts />
								<NavigationEditorShortcuts
									saveBlocks={ savePost }
								/>
								<Toolbar
									isPending={ ! hasLoadedMenus }
									navigationPost={ navigationPost }
								/>
								<Editor
									isPending={ ! hasLoadedMenus }
									blocks={ blocks }
								/>
								<InspectorAdditions
									menuId={ selectedMenuId }
									onDeleteMenu={ deleteMenu }
								/>
							</BlockEditorProvider>
						) }
					</div>

					<Popover.Slot />
				</DropZoneProvider>
			</SlotFillProvider>
		</ErrorBoundary>
	);
}
