import { ViewRegistry, uiState } from '@project/framework';
import './app-root';
import './demo-view';

uiState.update({ message: 'Initial Message' });

const viewRegistry = new ViewRegistry();

viewRegistry.register('demo-view', () => document.createElement('demo-view'));

const app = document.createElement('app-root');
document.body.appendChild(app);

document.body.appendChild(viewRegistry.getView('demo-view'));
