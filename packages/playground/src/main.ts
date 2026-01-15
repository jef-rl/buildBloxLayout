import { viewRegistry, uiState } from '@project/framework';
import './components/simple-view';
import { DEMO_LAYOUT } from './data/demo-layout';

// 1. Initialize the UI State Store with the demo layout
uiState.update(DEMO_LAYOUT);

// 2. Register the component available in the playground
viewRegistry.register('simple-view', () => document.createElement('simple-view'));

// 3. Mount the root workspace component to the DOM
const root = document.createElement('workspace-root');
document.body.append(root);
