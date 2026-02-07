import type { FrameworkState } from '../framework-state';

const isDev = (() => {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    // Ignore import.meta access errors.
  }

  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();

const PANEL_REGIONS = new Set(['main', 'left', 'right', 'bottom', 'overlay']);

const collectDuplicateIds = (ids: string[], label: string): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  ids.forEach((id) => {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  });

  if (duplicates.size === 0) {
    return [];
  }

  return [`Duplicate ${label} IDs: ${Array.from(duplicates).join(', ')}`];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function validateState(state: FrameworkState): void {
  if (!isDev) {
    return;
  }

  const errors: string[] = [];

  if (!state || typeof state !== 'object') {
    throw new Error('FrameworkState validation failed: state is not an object.');
  }

  const panels = Array.isArray(state.panels) ? state.panels : [];
  const views = Array.isArray(state.views) ? state.views : [];
  const viewDefinitions = Array.isArray(state.viewDefinitions) ? state.viewDefinitions : [];
  const viewInstances = isRecord(state.viewInstances) ? state.viewInstances : {};

  errors.push(...collectDuplicateIds(panels.map((panel) => panel.id), 'panel'));
  errors.push(...collectDuplicateIds(views.map((view) => view.id), 'view'));
  errors.push(...collectDuplicateIds(viewDefinitions.map((view) => view.id), 'view definition'));

  const viewInstanceEntries = Object.entries(viewInstances);
  const viewInstanceIds = viewInstanceEntries.map(([id]) => id);
  const viewInstanceIdSet = new Set(viewInstanceIds);
  errors.push(...collectDuplicateIds(viewInstanceIds, 'view instance'));

  viewInstanceEntries.forEach(([id, instance]) => {
    if (!isRecord(instance)) {
      errors.push(`viewInstances[${id}] is not an object.`);
      return;
    }
    const instanceId = instance.instanceId;
    if (typeof instanceId !== 'string' || instanceId.trim() === '') {
      errors.push(`viewInstances[${id}].instanceId is missing or invalid.`);
    } else if (instanceId !== id) {
      errors.push(`viewInstances key '${id}' does not match instanceId '${instanceId}'.`);
    }
    if (typeof instance.definitionId !== 'string' || instance.definitionId.trim() === '') {
      errors.push(`viewInstances[${id}].definitionId is missing or invalid.`);
    }
  });

  const viewIds = views.map((view) => view.id);
  const viewComponentIds = views.map((view) => view.component);
  const viewDefinitionIds = viewDefinitions.map((view) => view.id);
  const knownViewIds = new Set([...viewInstanceIds, ...viewIds, ...viewComponentIds, ...viewDefinitionIds]);

  if (viewDefinitionIds.length > 0) {
    const definitionIdSet = new Set(viewDefinitionIds);
    viewInstanceEntries.forEach(([id, instance]) => {
      if (!isRecord(instance)) {
        return;
      }
      const definitionId = instance.definitionId;
      if (typeof definitionId === 'string' && !definitionIdSet.has(definitionId)) {
        errors.push(`viewInstances[${id}] references unknown definitionId '${definitionId}'.`);
      }
    });
  }

  panels.forEach((panel) => {
    if (!panel || typeof panel.id !== 'string') {
      errors.push('Panel entry is missing a valid id.');
      return;
    }

    if (!PANEL_REGIONS.has(panel.region)) {
      errors.push(`Panel '${panel.id}' has invalid region '${panel.region}'.`);
    }

    const viewId = panel.viewId ?? null;
    const activeViewId = panel.activeViewId ?? null;
    const referencedIds = [viewId, activeViewId].filter(
      (value): value is string => typeof value === 'string' && value.trim() !== '',
    );

    if (knownViewIds.size > 0) {
      referencedIds.forEach((id) => {
        if (!knownViewIds.has(id)) {
          errors.push(`Panel '${panel.id}' references unknown view id '${id}'.`);
        }
      });
    }

    if (panel.view) {
      const panelViewId = typeof panel.view.id === 'string' ? panel.view.id : null;
      if (!panelViewId || panelViewId.trim() === '') {
        errors.push(`Panel '${panel.id}' has a view entry with an invalid id.`);
      } else if (!viewInstanceIdSet.has(panelViewId) && !viewIds.includes(panelViewId)) {
        errors.push(`Panel '${panel.id}' has view '${panelViewId}' not present in state.views.`);
      }
    }
  });

  if (state.activeView && knownViewIds.size > 0 && !knownViewIds.has(state.activeView)) {
    errors.push(`activeView '${state.activeView}' does not exist in views or viewInstances.`);
  }

  if (state.layout?.overlayView && knownViewIds.size > 0 && !knownViewIds.has(state.layout.overlayView)) {
    errors.push(`layout.overlayView '${state.layout.overlayView}' does not exist in views or viewInstances.`);
  }

  const layout = state.layout;
  if (layout) {
    const orderCollections: Array<{ name: string; value: string[] }> = [
      { name: 'layout.mainViewOrder', value: Array.isArray(layout.mainViewOrder) ? layout.mainViewOrder : [] },
      { name: 'layout.leftViewOrder', value: Array.isArray(layout.leftViewOrder) ? layout.leftViewOrder : [] },
      { name: 'layout.rightViewOrder', value: Array.isArray(layout.rightViewOrder) ? layout.rightViewOrder : [] },
      { name: 'layout.bottomViewOrder', value: Array.isArray(layout.bottomViewOrder) ? layout.bottomViewOrder : [] },
    ];

    orderCollections.forEach(({ name, value }) => {
      const duplicates = collectDuplicateIds(value, `${name} entry`);
      errors.push(...duplicates.map((message) => message.replace('Duplicate', `Duplicate in ${name}:`)));

      if (knownViewIds.size > 0) {
        value.forEach((id) => {
          if (typeof id === 'string' && !knownViewIds.has(id)) {
            errors.push(`${name} contains unknown view id '${id}'.`);
          }
        });
      }
    });

    if (typeof layout.mainAreaCount === 'number') {
      if (layout.mainAreaCount < 1 || layout.mainAreaCount > 5) {
        errors.push(`layout.mainAreaCount '${layout.mainAreaCount}' is out of range (1-5).`);
      }

      const mainPanels = panels.filter((panel) => panel.region === 'main');
      if (mainPanels.length > 0 && mainPanels.length !== layout.mainAreaCount) {
        errors.push(
          `layout.mainAreaCount '${layout.mainAreaCount}' does not match main panels count '${mainPanels.length}'.`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`FrameworkState validation failed:\n- ${errors.join('\n- ')}`);
  }
}
