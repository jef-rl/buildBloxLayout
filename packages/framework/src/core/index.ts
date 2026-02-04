// Legacy API (backwards compatible)
export * from './bootstrap';

// New simplified API
export { Framework, type FrameworkConfig } from './framework-singleton';
export { view, frameworkView, type ViewDecoratorOptions } from './decorators';
export {
  type SimpleViewConfig,
  normalizeViewConfig,
  isSimpleViewConfig,
} from './simple-view-config';
export {
  BUILT_IN_VIEWS,
  getBuiltInViewIds,
  isBuiltInView,
  registerBuiltInViews,
} from './built-in-views';
export {
  inferIcon,
  deriveNameFromId,
  deriveTagFromId,
  toKebabCase,
  DEFAULT_DEV_LOGGER,
  NOOP_LOGGER,
} from './defaults';
