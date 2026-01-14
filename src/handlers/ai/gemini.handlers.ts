import { html } from 'lit';
import type { UiDispatch, UiState } from '../../core/state/ui-state.js';
import type { AiPanel, HandlerMessage } from '../../core/types/index.js';
import type { GeminiClient } from '../../core/services/gemini.js';
import type { ViewRegistryEntry } from '../../core/registry/views';

interface AiHandlerHost {
  getState: () => UiState;
  dispatch: UiDispatch;
  applyAction: UiDispatch;
  gemini: GeminiClient;
  panelRegistry: ViewRegistryEntry[];
  isPanelEnabled: (panelId: AiPanel) => boolean;
}

export function createGeminiHandlers(host: AiHandlerHost) {
  const getPanelEntry = (panelId: AiPanel) => host.panelRegistry.find((panel) => panel.id === panelId);

  const isAiEnabled = (panelId: AiPanel) => {
    const panel = getPanelEntry(panelId);
    return !!panel?.hasAi && host.isPanelEnabled(panelId);
  };

  const generateWithGemini = async (panelId?: AiPanel) => {
    const aiState = host.getState().ai;
    const activePanel = panelId || aiState.activePanel;
    const promptInput = aiState.promptInput?.trim();
    if (!promptInput || !activePanel) return;

    const entry = getPanelEntry(activePanel);
    if (!entry) return;
    if (entry.validation && entry.validation() === false) return;

    host.applyAction({ type: 'ai/generate/start', panelId: activePanel });
    let instr = host.getState().ai.systemInstructions[activePanel] ?? entry.systemInstruction ?? '';
    if (entry.decorateInstruction) instr = entry.decorateInstruction(instr);
    const context = entry.getPromptContext ? entry.getPromptContext() : '';
    const prompt = `${instr}\n\n${context ? `${context}\n\n` : ''}User Request: ${promptInput}`;

    try {
      const response = await host.gemini.generateText(prompt);
      const trimmed = (response ?? '').trim();
      if (!trimmed) throw new Error('Empty response from Gemini');
      const content = trimmed.replace(/^```(json|html|css)?\n/, '').replace(/\n```$/, '');
      host.applyAction({ type: 'ai/generate/success', panelId: activePanel, content });
      if (entry.onGenerate) entry.onGenerate(content);
      host.applyAction({ type: 'view/close' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      host.applyAction({ type: 'ai/generate/error', panelId: activePanel, error: errorMessage });
      alert('AI Generation Failed');
    }
  };

  const renderAiPromptView = () => html`<ai-prompt-modal></ai-prompt-modal>`;

  const renderSettingsView = () => html`<settings-modal></settings-modal>`;

  const openAiModal = (panelId: AiPanel) => {
    if (!isAiEnabled(panelId)) return;
    host.dispatch({ type: 'ai/open', panelId, prompt: '' });
    host.dispatch({ type: 'view/open', viewId: 'ai-prompt', options: { disableCloseWhileGenerating: true } });
  };

  const handleDispatch = (message: HandlerMessage<{ panelId?: AiPanel } | null>) => {
    if (message?.type === 'ai/generate/start') {
      const panelId = message.payload?.panelId;
      void generateWithGemini(panelId);
      return true;
    }
    return false;
  };

  return {
    renderAiPromptView,
    renderSettingsView,
    openAiModal,
    isAiEnabled,
    generateWithGemini,
    handleDispatch,
  };
}

export type AiHandlers = ReturnType<typeof createGeminiHandlers>;
