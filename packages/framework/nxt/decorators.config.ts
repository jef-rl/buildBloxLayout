/**
 * Decorators for framework view registration.
 *
 * Usage:
 * ```typescript
 * @view({ icon: 'calculate' })
 * @customElement('counter-demo')
 * export class CounterDemo extends LitElement {
 *   // ...
 * }
 * ```
 *
 * The @view decorator registers the component with the framework automatically.
 * The ID is derived from the class name (converted to kebab-case) unless specified.
 */

import { Framework } from './framework-singleton.state';
import { toKebabCase } from './defaults.config'; 

/**
 * Options for the @view decorator.
 */
export interface ViewDecoratorOptions {
  /**
   * Unique identifier for the view.
   * Defaults to the class name converted to kebab-case.
   * @example 'counter-demo' (for class CounterDemo)
   */
  id?: string;

  /**
   * Human-readable name for the view.
   * Defaults to the ID converted to title case.
   */
  name?: string;

  /**
   * Material Icon name for the view.
   * If not provided, will be inferred from the ID.
   */
  icon?: string;

  /**
   * Default context data for new view instances.
   */
  defaultContext?: Record<string, unknown>;
}

/**
 * Class decorator that registers a view component with the framework.
 *
 * @param options - Optional configuration for the view
 * @returns Class decorator function
 *
 * @example
 * ```typescript
 * // Basic usage - ID derived from class name
 * @view()
 * @customElement('my-counter')
 * class MyCounter extends LitElement {}
 *
 * // With custom ID and icon
 * @view({ id: 'counter-demo', icon: 'calculate' })
 * @customElement('counter-demo')
 * class CounterDemo extends LitElement {}
 *
 * // With default context
 * @view({ defaultContext: { count: 0 } })
 * @customElement('counter-view')
 * class CounterView extends LitElement {}
 * ```
 */
export function view(options: ViewDecoratorOptions = {}) {
  return function <T extends CustomElementConstructor>(constructor: T): T {
    const className = constructor.name;
    const id = options.id ?? toKebabCase(className);

    // Register with the framework
    Framework.registerView({
      id,
      component: constructor,
      name: options.name,
      icon: options.icon,
      defaultContext: options.defaultContext,
    });

    return constructor;
  };
}

/**
 * Alternative decorator name for those who prefer 'frameworkView'.
 */
export const frameworkView = view;
