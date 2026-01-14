import type { UiDispatch, UiState } from '../../core/state/ui-state.js';
import type { AiPanel } from '../../core/types/index.js';

interface PromptHandlerHost {
  getState: () => UiState;
  dispatch: UiDispatch;
  generateWithGemini: (panelId?: AiPanel) => Promise<void>;
}

export function createPromptHandlers(host: PromptHandlerHost) {
  const getPromptState = () => {
    const aiState = host.getState().ai;
    return {
      promptInput: aiState.promptInput ?? '',
      activePanel: aiState.activePanel ?? '',
      isGenerating: aiState.isGenerating ?? false,
    };
  };

  const handlePromptChange = (prompt: string, panelId?: AiPanel) => {
    const targetPanel = panelId ?? host.getState().ai.activePanel;
    host.dispatch({ type: 'ai/setPrompt', prompt, panelId: targetPanel });
  };

  const handleGenerateRequest = (panelId?: AiPanel) => {
    const targetPanel = panelId ?? host.getState().ai.activePanel;
    if (!targetPanel) return;
    void host.generateWithGemini(targetPanel);
  };

  return {
    getPromptState,
    handlePromptChange,
    handleGenerateRequest,
  };
}

export type PromptHandlers = ReturnType<typeof createPromptHandlers>;
