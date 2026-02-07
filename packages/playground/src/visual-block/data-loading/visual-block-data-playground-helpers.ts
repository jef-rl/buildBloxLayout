import type { Action } from '../../../../framework/src/nxt';
import type { VisualBlockDataEffectDeps } from './visual-block-data-effects';
import { mapRawVisualBlockDataToDefinitionDTO } from './visual-block-data-mapper';

export interface VisualBlockDataSourceConfig {
  sourceId: string;
  url: string;
  label?: string;
}

export function createVisualBlockDataSourceConfig(
  sourceId: string,
  url: string,
  label?: string,
): VisualBlockDataSourceConfig {
  return {
    sourceId,
    url,
    label,
  };
}

type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type VisualBlockDataEffectDepsOptions = {
  dispatch: (action: Action<any>) => void;
  fetchImpl?: FetchImpl;
  logError?: (message: string, error?: unknown) => void;
};

const buildUrlWithParams = (url: string, params?: Record<string, unknown>): string => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const [base, existingQuery] = url.split('?');
  const searchParams = new URLSearchParams(existingQuery ?? '');
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
};

export function createVisualBlockDataEffectDepsForPlayground(
  configs: VisualBlockDataSourceConfig[],
  options: VisualBlockDataEffectDepsOptions,
): VisualBlockDataEffectDeps {
  const sourcesById = new Map(configs.map((config) => [config.sourceId, config]));
  const fetchImpl: FetchImpl | undefined = options.fetchImpl ?? globalThis.fetch;

  return {
    dispatch: options.dispatch,
    logError: options.logError,
    buildUrlForSource: (sourceId: string, params?: Record<string, unknown>) => {
      const config = sourcesById.get(sourceId);
      if (!config) {
        throw new Error(`Unknown visual block data source: ${sourceId}`);
      }
      return buildUrlWithParams(config.url, params);
    },
    fetchJson: async (url: string) => {
      if (!fetchImpl) {
        throw new Error('No fetch implementation available for visual block data.');
      }
      const response = await fetchImpl(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch visual block data: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    mapRawToDefinition: mapRawVisualBlockDataToDefinitionDTO,
  };
}
