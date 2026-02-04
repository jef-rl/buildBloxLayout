/**
 * Simplified view configuration for the new Framework API.
 * Users provide minimal config, and the framework derives the rest.
 */

import type { ViewDefinition, ViewComponent } from '../types/index';
import { inferIcon, deriveNameFromId, deriveTagFromId } from './defaults';
import { logWarn } from '../nxt/runtime/engine/logging/framework-logger';

/**
 * Simplified view configuration that users provide.
 * Only `id` and `component` are required - everything else is auto-derived.
 */
export interface SimpleViewConfig {
  /** Unique identifier for the view (required) */
  id: string;

  /** The component class (not a loader function) */
  component: CustomElementConstructor;

  /** Human-readable name (auto-derived from id if not provided) */
  name?: string;

  /** Display title (defaults to name if not provided) */
  title?: string;

  /** Material Icon name (auto-inferred from id if not provided) */
  icon?: string;

  /** Custom element tag name (auto-derived from id if not provided) */
  tag?: string;

  /** Default context data for new instances */
  defaultContext?: Record<string, unknown>;
}

/**
 * Find the tag name for an already-registered custom element constructor.
 * Returns undefined if the constructor hasn't been registered.
 */
function findExistingTag(component: CustomElementConstructor): string | undefined {
  // Check if Lit has stored the tag name on the class (Lit's convention)
  const litTag = (component as any).elementProperties
    ? (component as any)._tag || (component as any).is
    : undefined;
  if (litTag && customElements.get(litTag) === component) {
    return litTag;
  }

  // Fallback: check common tag patterns based on class name
  const className = component.name;
  if (className) {
    // Convert PascalCase to kebab-case (e.g., CounterView -> counter-view)
    const kebabName = className
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();

    if (customElements.get(kebabName) === component) {
      return kebabName;
    }

    // Also try without -view suffix patterns
    const withoutView = kebabName.replace(/-view$/, '');
    if (customElements.get(withoutView) === component) {
      return withoutView;
    }
  }

  return undefined;
}

/**
 * Normalize a SimpleViewConfig into a full ViewDefinition.
 * Auto-derives missing properties and ensures the custom element is registered.
 *
 * @param config - The simplified view config from the user
 * @returns A full ViewDefinition for internal use
 */
export function normalizeViewConfig(config: SimpleViewConfig): ViewDefinition {
  const { id, component, defaultContext } = config;

  // Derive missing properties
  let tag = config.tag ?? deriveTagFromId(id);
  const name = config.name ?? deriveNameFromId(id);
  const title = config.title ?? name;
  const icon = config.icon ?? inferIcon(id);

  // Check if this component class is already registered with a different tag
  const existingTag = findExistingTag(component);
  if (existingTag) {
    // Use the existing tag - component was already registered (e.g., via @customElement decorator)
    tag = existingTag;
  } else if (!customElements.get(tag)) {
    // Register the element with the derived/provided tag
    try {
      customElements.define(tag, component);
    } catch (e) {
      // If registration fails (constructor already used with different tag),
      // try to find what tag it was registered with
      const fallbackTag = findExistingTag(component);
      if (fallbackTag) {
        tag = fallbackTag;
      } else {
        logWarn(
          `[Framework] Could not register component for view "${id}". ` +
            `The component may already be registered with a different tag.`,
          { error: e }
        );
      }
    }
  }

  // Create a component loader that returns the already-loaded component
  const componentLoader: ViewComponent = () => Promise.resolve(component);

  return {
    id,
    name,
    title,
    tag,
    icon,
    component: componentLoader,
    defaultContext: (defaultContext as Record<string, any>) ?? {},
  };
}

/**
 * Check if a value is a SimpleViewConfig (has component as a class)
 * vs a full ViewDefinition (has component as a function).
 */
export function isSimpleViewConfig(
  config: SimpleViewConfig | ViewDefinition
): config is SimpleViewConfig {
  return (
    typeof config.component === 'function' &&
    config.component.prototype !== undefined &&
    !(config.component.prototype instanceof Promise)
  );
}
