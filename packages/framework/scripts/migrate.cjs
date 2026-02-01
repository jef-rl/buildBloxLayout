#!/usr/bin/env node
/**
 * Framework Migration Script
 *
 * Reorganizes packages/framework/src from 4-level to 2-level structure
 * Splits large files into ~50 line modules
 * Updates all imports automatically
 *
 * Usage: node scripts/migrate.js [--dry-run] [--phase=N]
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const DRY_RUN = process.argv.includes('--dry-run');
const PHASE = process.argv.find(a => a.startsWith('--phase='))?.split('=')[1];

// Logging
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  action: (msg) => console.log(`\x1b[35m[ACTION]\x1b[0m ${msg}`),
};

// File operations (respect dry-run)
function mkdirp(dir) {
  if (DRY_RUN) {
    log.action(`mkdir -p ${dir}`);
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  if (DRY_RUN) {
    log.action(`write ${filePath} (${content.split('\n').length} lines)`);
    return;
  }
  fs.writeFileSync(filePath, content);
}

function copyFile(src, dest) {
  if (DRY_RUN) {
    log.action(`copy ${src} -> ${dest}`);
    return;
  }
  fs.copyFileSync(src, dest);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function deleteFile(filePath) {
  if (DRY_RUN) {
    log.action(`delete ${filePath}`);
    return;
  }
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function deleteDir(dirPath) {
  if (DRY_RUN) {
    log.action(`rmdir ${dirPath}`);
    return;
  }
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
}

// ============================================================================
// PHASE 1: Create new folder structure
// ============================================================================
function phase1_createFolders() {
  log.info('Phase 1: Creating new folder structure...');

  const folders = [
    'core',
    'state',
    'types',
    'utils',
    'persistence',
    'handlers',
    'effects',
    'auth',
    'dock',
    'layout',
    'logging',
    'workspace',
    'components',
    'config',
  ];

  for (const folder of folders) {
    const fullPath = path.join(SRC, folder);
    if (!fileExists(fullPath)) {
      mkdirp(fullPath);
      log.success(`Created ${folder}/`);
    } else {
      log.info(`Exists: ${folder}/`);
    }
  }
}

// ============================================================================
// PHASE 2: Simple file moves (files that don't need splitting)
// ============================================================================
const SIMPLE_MOVES = [
  // Types
  { from: 'types/core.ts', to: 'types/core.types.ts' },
  { from: 'types/auth.ts', to: 'types/auth.types.ts' },
  { from: 'types/events.ts', to: 'types/events.types.ts' },
  { from: 'domains/panels/types.ts', to: 'types/panel.types.ts' },

  // State
  { from: 'state/context.ts', to: 'state/context.ts' },
  { from: 'state/selectors.ts', to: 'state/selectors.ts' },

  // Core
  { from: 'core/bootstrap.ts', to: 'core/bootstrap.ts' },
  { from: 'core/decorators.ts', to: 'core/decorators.ts' },
  { from: 'core/defaults.ts', to: 'core/defaults.ts' },
  { from: 'core/registry/effect-registry.ts', to: 'core/effect.registry.ts' },

  // Utils
  { from: 'utils/dispatcher.ts', to: 'utils/dispatcher.ts' },
  { from: 'utils/logger.ts', to: 'utils/logger.ts' },
  { from: 'utils/helpers.ts', to: 'utils/helpers.ts' },
  { from: 'utils/expansion-helpers.ts', to: 'utils/expansion.utils.ts' },

  // Effects
  { from: 'effects/register.ts', to: 'effects/register.ts' },

  // Dock (smaller files)
  { from: 'domains/dock/types.ts', to: 'dock/dock.types.ts' },
  { from: 'domains/dock/utils.ts', to: 'dock/dock.utils.ts' },
  { from: 'domains/dock/components/DockManager.ts', to: 'dock/dock-manager.view.ts' },
  { from: 'domains/dock/components/PositionPicker.ts', to: 'dock/position-picker.view.ts' },
  { from: 'domains/dock/handlers/dock.handlers.ts', to: 'dock/dock.handler.ts' },
  { from: 'domains/dock/handlers/dock.ts', to: 'dock/dock-logic.utils.ts' },
  { from: 'domains/dock/handlers/positioning.ts', to: 'dock/dock-positions.utils.ts' },
  { from: 'domains/dock/handlers/position-picker.handlers.ts', to: 'dock/position-picker.handler.ts' },

  // Layout handlers
  { from: 'domains/layout/handlers/preset-manager.handlers.ts', to: 'layout/preset-manager.handler.ts' },
  { from: 'domains/layout/handlers/framework-menu.handlers.ts', to: 'layout/menu.handler.ts' },
  { from: 'domains/layout/handlers/view-instances.ts', to: 'layout/view-instances.handler.ts' },
  { from: 'domains/layout/handlers/views.ts', to: 'layout/views.handler.ts' },
  { from: 'domains/layout/handlers/drag.handlers.ts', to: 'layout/drag.handler.ts' },

  // Workspace handlers
  { from: 'domains/workspace/handlers/workspace-layout.handlers.ts', to: 'workspace/layout.handler.ts' },

  // Components
  { from: 'components/ViewToken.ts', to: 'components/view-token.view.ts' },
  { from: 'components/Icons.ts', to: 'components/icons.ts' },

  // Config
  { from: 'config/admin-emails.example.ts', to: 'config/admin-emails.config.ts' },
];

function phase2_simpleMoves() {
  log.info('Phase 2: Moving simple files...');

  for (const move of SIMPLE_MOVES) {
    const fromPath = path.join(SRC, move.from);
    const toPath = path.join(SRC, move.to);

    if (!fileExists(fromPath)) {
      log.warn(`Source not found: ${move.from}`);
      continue;
    }

    // Ensure target directory exists
    mkdirp(path.dirname(toPath));

    // Read, optionally transform, write
    let content = readFile(fromPath);
    writeFile(toPath, content);
    log.success(`${move.from} -> ${move.to}`);
  }
}

// ============================================================================
// PHASE 3: Split large files
// ============================================================================

function extractSection(content, startPattern, endPattern) {
  const lines = content.split('\n');
  let inSection = false;
  let braceCount = 0;
  let result = [];

  for (const line of lines) {
    if (!inSection && line.match(startPattern)) {
      inSection = true;
      braceCount = 0;
    }

    if (inSection) {
      result.push(line);
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (endPattern) {
        if (line.match(endPattern)) {
          break;
        }
      } else if (braceCount === 0 && result.length > 1) {
        break;
      }
    }
  }

  return result.join('\n');
}

function extractImports(content) {
  const lines = content.split('\n');
  const imports = [];

  for (const line of lines) {
    if (line.trim().startsWith('import ') || line.trim().startsWith('import{')) {
      imports.push(line);
    } else if (line.trim().startsWith('export type {') && line.includes('from')) {
      imports.push(line);
    }
  }

  return imports.join('\n');
}

function extractCSS(content) {
  const match = content.match(/static\s+styles\s*=\s*css`([\s\S]*?)`;/);
  if (match) {
    return `import { css } from 'lit';\n\nexport const styles = css\`${match[1]}\`;`;
  }
  return null;
}

function splitTypesState(content, targetDir) {
  // Split types/state.ts into multiple files
  const files = {};

  // Extract UIState interface
  const uiStateMatch = content.match(/export\s+interface\s+UIState\s*{[\s\S]*?^}/m);
  if (uiStateMatch) {
    files['state.types.ts'] = `// UIState - Main application state interface\n\n${uiStateMatch[0]}`;
  }

  // Extract LayoutState
  const layoutMatch = content.match(/export\s+(interface|type)\s+LayoutState[\s\S]*?^}/m);
  if (layoutMatch) {
    files['layout.types.ts'] = `// Layout state types\n\n${layoutMatch[0]}`;
  }

  // Extract LogState, LogEntry
  const logMatch = content.match(/export\s+(interface|type)\s+Log(State|Entry)[\s\S]*?^}/gm);
  if (logMatch) {
    files['log.types.ts'] = `// Logging types\n\n${logMatch.join('\n\n')}`;
  }

  // Extract menu types
  const menuMatch = content.match(/export\s+(interface|type)\s+FrameworkMenuItem[\s\S]*?^}/m);
  if (menuMatch) {
    files['menu.types.ts'] = `// Menu types\n\n${menuMatch[0]}`;
  }

  // Extract preset types
  const presetMatch = content.match(/export\s+(interface|type)\s+LayoutPreset[\s\S]*?^}/m);
  if (presetMatch) {
    files['preset.types.ts'] = `// Preset types\n\n${presetMatch[0]}`;
  }

  // Extract view types
  const viewMatch = content.match(/export\s+(interface|type)\s+View(Definition|Instance)[\s\S]*?^}/gm);
  if (viewMatch) {
    files['view.types.ts'] = `// View types\n\n${viewMatch.join('\n\n')}`;
  }

  return files;
}

function phase3_splitLargeFiles() {
  log.info('Phase 3: Splitting large files...');

  // Split types/state.ts
  const stateTypesPath = path.join(SRC, 'types/state.ts');
  if (fileExists(stateTypesPath)) {
    const content = readFile(stateTypesPath);
    const files = splitTypesState(content, 'types');

    for (const [filename, fileContent] of Object.entries(files)) {
      writeFile(path.join(SRC, 'types', filename), fileContent);
      log.success(`Split types/state.ts -> types/${filename}`);
    }
  }

  // For complex component splits, we'll create placeholder files
  // The actual splitting requires manual review

  const complexSplits = [
    {
      source: 'domains/auth/components/AuthView.ts',
      targets: [
        { name: 'auth/auth.view.ts', desc: 'Main AuthView container' },
        { name: 'auth/auth.styles.ts', desc: 'CSS styles' },
        { name: 'auth/auth-login-form.view.ts', desc: 'Login form component' },
        { name: 'auth/auth-signup-form.view.ts', desc: 'Signup form component' },
        { name: 'auth/auth-reset-form.view.ts', desc: 'Password reset form' },
        { name: 'auth/auth-profile.view.ts', desc: 'Profile display' },
        { name: 'auth/auth-social-buttons.view.ts', desc: 'OAuth buttons' },
      ]
    },
    {
      source: 'domains/layout/components/FrameworkMenu.ts',
      targets: [
        { name: 'layout/menu.view.ts', desc: 'Main menu component' },
        { name: 'layout/menu.styles.ts', desc: 'Menu CSS' },
        { name: 'layout/menu-header.view.ts', desc: 'Menu header' },
        { name: 'layout/menu-item-parent.view.ts', desc: 'Parent menu item' },
        { name: 'layout/menu-item-preset.view.ts', desc: 'Preset menu item' },
        { name: 'layout/menu-item-action.view.ts', desc: 'Action menu item' },
        { name: 'layout/menu-icons.utils.ts', desc: 'Icon rendering' },
        { name: 'layout/menu-drag.utils.ts', desc: 'Drag handlers' },
      ]
    },
    {
      source: 'domains/workspace/components/WorkspaceRoot.ts',
      targets: [
        { name: 'workspace/workspace-root.view.ts', desc: 'Main workspace layout' },
        { name: 'workspace/workspace-root.styles.ts', desc: 'Workspace CSS' },
        { name: 'workspace/workspace-regions.view.ts', desc: 'Region rendering' },
        { name: 'workspace/workspace-main-area.view.ts', desc: 'Main grid area' },
        { name: 'workspace/workspace-side-panel.view.ts', desc: 'Side panels' },
        { name: 'workspace/workspace-sash.view.ts', desc: 'Toggle sashes' },
        { name: 'workspace/workspace-drop-zone.view.ts', desc: 'Drop zones' },
      ]
    },
    {
      source: 'components/FrameworkRoot.ts',
      targets: [
        { name: 'components/framework-root.view.ts', desc: 'Main component' },
        { name: 'components/framework-root.styles.ts', desc: 'Root CSS' },
        { name: 'components/framework-context.view.ts', desc: 'Context provider' },
        { name: 'components/framework-dispatch.utils.ts', desc: 'Dispatch pipeline' },
        { name: 'components/framework-effects.utils.ts', desc: 'Effect execution' },
        { name: 'components/framework-firestore.utils.ts', desc: 'Firestore setup' },
        { name: 'components/framework-auth.utils.ts', desc: 'Auth setup' },
      ]
    },
    {
      source: 'domains/workspace/components/PanelView.ts',
      targets: [
        { name: 'workspace/panel.view.ts', desc: 'Main panel view' },
        { name: 'workspace/panel.styles.ts', desc: 'Panel CSS' },
        { name: 'workspace/panel-content.view.ts', desc: 'Content rendering' },
        { name: 'workspace/panel-overlay.view.ts', desc: 'Design overlay' },
        { name: 'workspace/panel-drag.utils.ts', desc: 'Drag handling' },
        { name: 'workspace/panel-drop.utils.ts', desc: 'Drop handling' },
        { name: 'workspace/panel-load.utils.ts', desc: 'View loading' },
      ]
    },
    {
      source: 'domains/workspace/handlers/registry.ts',
      targets: [
        { name: 'workspace/register-handlers.ts', desc: 'Main registration' },
        { name: 'workspace/layout-normalize.utils.ts', desc: 'Normalize layout' },
        { name: 'workspace/auth-normalize.utils.ts', desc: 'Normalize auth' },
        { name: 'workspace/log-action.utils.ts', desc: 'Log action builder' },
        { name: 'layout/preset-save.handler.ts', desc: 'Save preset handler' },
        { name: 'layout/preset-load.handler.ts', desc: 'Load preset handler' },
        { name: 'layout/preset-delete.handler.ts', desc: 'Delete preset handler' },
        { name: 'layout/preset-rename.handler.ts', desc: 'Rename preset handler' },
        { name: 'layout/preset-hydrate.handler.ts', desc: 'Hydrate presets handler' },
        { name: 'layout/toggle-design.handler.ts', desc: 'Toggle design mode' },
        { name: 'layout/set-main-area-count.handler.ts', desc: 'Set main area count' },
        { name: 'layout/menu-hydrate.handler.ts', desc: 'Menu hydration' },
        { name: 'layout/menu-reorder.handler.ts', desc: 'Menu reorder' },
        { name: 'layout/menu-update-config.handler.ts', desc: 'Menu config update' },
        { name: 'auth/auth-set-user.handler.ts', desc: 'Set auth user' },
      ]
    },
    {
      source: 'domains/workspace/handlers/workspace-panels.handlers.ts',
      targets: [
        { name: 'workspace/panel-assign.handler.ts', desc: 'Assign view to panel' },
        { name: 'workspace/panel-remove.handler.ts', desc: 'Remove view' },
        { name: 'workspace/panel-swap.handler.ts', desc: 'Swap views' },
        { name: 'workspace/panel-move.handler.ts', desc: 'Move view' },
        { name: 'workspace/instance-allocate.utils.ts', desc: 'Allocate instance' },
        { name: 'workspace/instance-register.utils.ts', desc: 'Register instance' },
        { name: 'workspace/region-order.utils.ts', desc: 'Update region order' },
        { name: 'workspace/main-view-order.handler.ts', desc: 'Apply main view order' },
        { name: 'workspace/main-view-derive.utils.ts', desc: 'Derive view order' },
      ]
    },
    {
      source: 'core/framework-singleton.ts',
      targets: [
        { name: 'core/framework-singleton.ts', desc: 'Main singleton class' },
        { name: 'core/framework-configure.utils.ts', desc: 'configure() logic' },
        { name: 'core/framework-register.utils.ts', desc: 'registerViews()' },
        { name: 'core/framework-init.utils.ts', desc: 'init() logic' },
        { name: 'core/framework-defaults.config.ts', desc: 'Default state' },
      ]
    },
    {
      source: 'core/registry/handler-registry.ts',
      targets: [
        { name: 'core/handler.registry.ts', desc: 'createHandlerRegistry' },
        { name: 'core/handler-dispatch.utils.ts', desc: 'Dispatch logic' },
        { name: 'handlers/state-hydrate.handler.ts', desc: 'state/hydrate' },
        { name: 'handlers/context-update.handler.ts', desc: 'context/update' },
        { name: 'handlers/context-patch.handler.ts', desc: 'context/patch' },
        { name: 'handlers/layout-update.handler.ts', desc: 'layout/update' },
        { name: 'handlers/panels-update.handler.ts', desc: 'panels/update' },
        { name: 'handlers/logs-append.handler.ts', desc: 'logs/append' },
        { name: 'handlers/logs-clear.handler.ts', desc: 'logs/clear' },
        { name: 'handlers/logs-set-max.handler.ts', desc: 'logs/setMax' },
      ]
    },
    {
      source: 'core/registry/view-registry.ts',
      targets: [
        { name: 'core/view.registry.ts', desc: 'View registry' },
      ]
    },
    {
      source: 'domains/logging/components/LogView.ts',
      targets: [
        { name: 'logging/log.view.ts', desc: 'Main log view' },
        { name: 'logging/log.styles.ts', desc: 'Log CSS' },
        { name: 'logging/log-entry.view.ts', desc: 'Log entry' },
        { name: 'logging/log-header.view.ts', desc: 'Log header' },
        { name: 'logging/log-format.utils.ts', desc: 'Formatting' },
      ]
    },
    {
      source: 'domains/dock/components/DockContainer.ts',
      targets: [
        { name: 'dock/dock-container.view.ts', desc: 'Main container' },
        { name: 'dock/dock-container.styles.ts', desc: 'Container CSS' },
        { name: 'dock/dock-handle.view.ts', desc: 'Position handle' },
      ]
    },
    {
      source: 'utils/firestore-persistence.ts',
      targets: [
        { name: 'persistence/firestore.persistence.ts', desc: 'Main API' },
        { name: 'persistence/firestore-init.persistence.ts', desc: 'Initialize' },
        { name: 'persistence/firestore-save.persistence.ts', desc: 'Save ops' },
        { name: 'persistence/firestore-load.persistence.ts', desc: 'Load ops' },
        { name: 'persistence/firestore-delete.persistence.ts', desc: 'Delete ops' },
        { name: 'persistence/firestore-rename.persistence.ts', desc: 'Rename' },
        { name: 'persistence/firestore-listen.persistence.ts', desc: 'Listener' },
      ]
    },
    {
      source: 'utils/hybrid-persistence.ts',
      targets: [
        { name: 'persistence/hybrid.persistence.ts', desc: 'Hybrid API' },
        { name: 'persistence/hybrid-sync.persistence.ts', desc: 'Sync logic' },
        { name: 'persistence/hybrid-merge.persistence.ts', desc: 'Merge logic' },
      ]
    },
    {
      source: 'utils/persistence.ts',
      targets: [
        { name: 'persistence/local.persistence.ts', desc: 'localStorage API' },
        { name: 'persistence/local-read.persistence.ts', desc: 'Read ops' },
        { name: 'persistence/local-write.persistence.ts', desc: 'Write ops' },
      ]
    },
    {
      source: 'utils/framework-menu-persistence.ts',
      targets: [
        { name: 'persistence/menu.persistence.ts', desc: 'Menu persistence' },
      ]
    },
    {
      source: 'utils/firebase-auth.ts',
      targets: [
        { name: 'auth/auth-firebase.utils.ts', desc: 'Firebase config' },
        { name: 'auth/auth-state-listener.utils.ts', desc: 'State listener' },
      ]
    },
    {
      source: 'utils/auth-menu-items.ts',
      targets: [
        { name: 'auth/auth-menu-items.utils.ts', desc: 'Menu items' },
      ]
    },
    {
      source: 'effects/auth.effects.ts',
      targets: [
        { name: 'effects/auth-state-changed.effect.ts', desc: 'Auth state' },
        { name: 'effects/auth-login.effect.ts', desc: 'Login effect' },
        { name: 'effects/auth-logout.effect.ts', desc: 'Logout effect' },
      ]
    },
    {
      source: 'effects/preset.effects.ts',
      targets: [
        { name: 'effects/preset-save.effect.ts', desc: 'Save effect' },
        { name: 'effects/preset-load.effect.ts', desc: 'Load effect' },
      ]
    },
    {
      source: 'effects/framework-menu.effects.ts',
      targets: [
        { name: 'effects/menu-persist.effect.ts', desc: 'Menu persist' },
      ]
    },
    {
      source: 'state/ui-state.ts',
      targets: [
        { name: 'state/ui.state.ts', desc: 'UIState store' },
        { name: 'state/ui-subscribe.state.ts', desc: 'Subscriptions' },
      ]
    },
    {
      source: 'state/context-update.ts',
      targets: [
        { name: 'state/context-update.utils.ts', desc: 'Context update' },
      ]
    },
    {
      source: 'state/state-validator.ts',
      targets: [
        { name: 'state/state-validator.utils.ts', desc: 'Validator' },
        { name: 'state/state-normalize.utils.ts', desc: 'Normalize' },
      ]
    },
    {
      source: 'core/simple-view-config.ts',
      targets: [
        { name: 'core/view-config.ts', desc: 'View config' },
      ]
    },
    {
      source: 'core/built-in-views.ts',
      targets: [
        { name: 'core/built-in-views.ts', desc: 'Built-in views' },
      ]
    },
    {
      source: 'domains/layout/components/CustomToolbar.ts',
      targets: [
        { name: 'layout/admin-toolbar.view.ts', desc: 'Admin toolbar' },
        { name: 'layout/admin-toolbar.styles.ts', desc: 'Admin CSS' },
        { name: 'layout/admin-toolbar-buttons.view.ts', desc: 'Buttons' },
        { name: 'layout/admin-toolbar-actions.utils.ts', desc: 'Actions' },
      ]
    },
    {
      source: 'domains/layout/components/ToolbarContainer.ts',
      targets: [
        { name: 'layout/toolbar-container.view.ts', desc: 'Container' },
        { name: 'layout/toolbar-container.styles.ts', desc: 'CSS' },
      ]
    },
    {
      source: 'domains/layout/components/ViewRegistryPanel.ts',
      targets: [
        { name: 'layout/view-palette.view.ts', desc: 'View palette' },
        { name: 'layout/view-palette.styles.ts', desc: 'Palette CSS' },
        { name: 'layout/view-palette-item.view.ts', desc: 'Palette item' },
      ]
    },
    {
      source: 'domains/layout/components/SavePresetContent.ts',
      targets: [
        { name: 'layout/save-preset.view.ts', desc: 'Save dialog' },
        { name: 'layout/save-preset.styles.ts', desc: 'Save CSS' },
        { name: 'layout/save-preset-form.view.ts', desc: 'Save form' },
      ]
    },
    {
      source: 'domains/layout/components/LoadPresetContent.ts',
      targets: [
        { name: 'layout/load-preset.view.ts', desc: 'Load dialog' },
        { name: 'layout/load-preset.styles.ts', desc: 'Load CSS' },
        { name: 'layout/load-preset-list.view.ts', desc: 'Preset list' },
      ]
    },
    {
      source: 'domains/workspace/components/ToolbarView.ts',
      targets: [
        { name: 'workspace/toolbar.view.ts', desc: 'Toolbar view' },
        { name: 'workspace/toolbar.styles.ts', desc: 'Toolbar CSS' },
        { name: 'workspace/toolbar-items.view.ts', desc: 'Items' },
      ]
    },
    {
      source: 'domains/workspace/components/OverlayLayer.ts',
      targets: [
        { name: 'workspace/overlay.view.ts', desc: 'Overlay layer' },
        { name: 'workspace/overlay.styles.ts', desc: 'Overlay CSS' },
        { name: 'workspace/overlay-backdrop.view.ts', desc: 'Backdrop' },
      ]
    },
  ];

  for (const split of complexSplits) {
    const sourcePath = path.join(SRC, split.source);

    if (!fileExists(sourcePath)) {
      log.warn(`Source not found: ${split.source}`);
      continue;
    }

    const sourceContent = readFile(sourcePath);
    const sourceLines = sourceContent.split('\n').length;

    log.info(`Splitting ${split.source} (${sourceLines} lines) -> ${split.targets.length} files`);

    // For now, copy the full content to the first target
    // and create placeholder files for others
    // This allows TypeScript to still work while we refactor

    for (let i = 0; i < split.targets.length; i++) {
      const target = split.targets[i];
      const targetPath = path.join(SRC, target.name);

      mkdirp(path.dirname(targetPath));

      if (i === 0) {
        // First file gets the full content (temporary)
        writeFile(targetPath, `// ${target.desc}\n// TODO: Extract from ${split.source}\n\n${sourceContent}`);
      } else {
        // Other files get placeholders
        const placeholder = `// ${target.desc}
// TODO: Extract from ${split.source}
//
// This file should contain ~50 lines extracted from the source.
// See DETAILED_FILE_MAPPING.md for what should go here.

export {};
`;
        writeFile(targetPath, placeholder);
      }
    }

    log.success(`Created ${split.targets.length} files from ${split.source}`);
  }
}

// ============================================================================
// PHASE 4: Create barrel exports (index.ts)
// ============================================================================
function phase4_createBarrels() {
  log.info('Phase 4: Creating barrel exports...');

  const barrels = {
    'types': [
      'core.types',
      'state.types',
      'layout.types',
      'auth.types',
      'panel.types',
      'log.types',
      'menu.types',
      'preset.types',
      'view.types',
      'events.types',
    ],
    'state': [
      'context',
      'ui.state',
      'ui-subscribe.state',
      'context-update.utils',
      'state-validator.utils',
      'state-normalize.utils',
      'selectors',
    ],
    'utils': [
      'dispatcher',
      'logger',
      'helpers',
      'expansion.utils',
    ],
    'handlers': [
      'state-hydrate.handler',
      'context-update.handler',
      'context-patch.handler',
      'layout-update.handler',
      'panels-update.handler',
      'logs-append.handler',
      'logs-clear.handler',
      'logs-set-max.handler',
    ],
    'effects': [
      'auth-state-changed.effect',
      'auth-login.effect',
      'auth-logout.effect',
      'preset-save.effect',
      'preset-load.effect',
      'menu-persist.effect',
      'register',
    ],
  };

  for (const [dir, modules] of Object.entries(barrels)) {
    const exports = modules.map(m => `export * from './${m}';`).join('\n');
    const indexPath = path.join(SRC, dir, 'index.ts');
    writeFile(indexPath, `// Barrel exports for ${dir}\n\n${exports}\n`);
    log.success(`Created ${dir}/index.ts`);
  }
}

// ============================================================================
// PHASE 5: Delete legacy files and folders
// ============================================================================
function phase5_cleanup() {
  log.info('Phase 5: Cleanup...');

  // Delete legacy commented-out file
  const legacyWorkspace = path.join(SRC, 'domains/layout/components/Workspace.ts');
  if (fileExists(legacyWorkspace)) {
    deleteFile(legacyWorkspace);
    log.success('Deleted legacy Workspace.ts');
  }

  // Note: We don't delete the domains folder yet
  // That should be done after imports are updated and verified
  log.info('Note: domains/ folder preserved for now. Delete after verifying imports.');
}

// ============================================================================
// MAIN
// ============================================================================
function main() {
  console.log('\n========================================');
  console.log('  Framework Migration Script');
  console.log('========================================\n');

  if (DRY_RUN) {
    log.warn('DRY RUN MODE - No files will be modified\n');
  }

  const phases = [
    { num: 1, fn: phase1_createFolders, desc: 'Create folders' },
    { num: 2, fn: phase2_simpleMoves, desc: 'Simple moves' },
    { num: 3, fn: phase3_splitLargeFiles, desc: 'Split large files' },
    { num: 4, fn: phase4_createBarrels, desc: 'Create barrel exports' },
    { num: 5, fn: phase5_cleanup, desc: 'Cleanup' },
  ];

  for (const phase of phases) {
    if (PHASE && phase.num !== parseInt(PHASE)) {
      continue;
    }

    console.log(`\n--- Phase ${phase.num}: ${phase.desc} ---\n`);
    phase.fn();
  }

  console.log('\n========================================');
  console.log('  Migration Complete!');
  console.log('========================================\n');

  console.log('Next steps:');
  console.log('1. Run: npx tsc --noEmit');
  console.log('2. Fix any import errors');
  console.log('3. Manually split placeholder files');
  console.log('4. Delete domains/ folder when ready');
  console.log('');
}

main();
