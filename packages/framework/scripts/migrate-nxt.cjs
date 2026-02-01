#!/usr/bin/env node
/**
 * Framework Migration Script v2
 *
 * Creates new structure under nxt/ while preserving src/
 * Tracks progress for resumable execution
 *
 * Usage:
 *   node scripts/migrate-nxt.cjs [--dry-run] [--reset] [--step=N]
 *
 * Options:
 *   --dry-run   Preview changes without writing files
 *   --reset     Clear progress and start fresh
 *   --step=N    Run only step N (1-21)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const NXT = path.join(ROOT, 'nxt');
const PROGRESS_FILE = path.join(ROOT, 'migration-progress.json');

const DRY_RUN = process.argv.includes('--dry-run');
const RESET = process.argv.includes('--reset');
const STEP_ARG = process.argv.find(a => a.startsWith('--step='));
const SINGLE_STEP = STEP_ARG ? parseInt(STEP_ARG.split('=')[1]) : null;

// ============================================================================
// Progress Tracking
// ============================================================================
function loadProgress() {
  if (RESET) {
    return { completedSteps: [], lastRun: null };
  }
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.log('[WARN] Could not load progress file, starting fresh');
  }
  return { completedSteps: [], lastRun: null };
}

function saveProgress(progress) {
  if (DRY_RUN) return;
  progress.lastRun = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function markStepComplete(progress, step) {
  if (!progress.completedSteps.includes(step)) {
    progress.completedSteps.push(step);
  }
  saveProgress(progress);
}

function isStepComplete(progress, step) {
  return progress.completedSteps.includes(step);
}

// ============================================================================
// Logging
// ============================================================================
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[OK]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  step: (n, msg) => console.log(`\x1b[35m[STEP ${n}]\x1b[0m ${msg}`),
  skip: (msg) => console.log(`\x1b[90m[SKIP]\x1b[0m ${msg}`),
};

// ============================================================================
// File Operations
// ============================================================================
function mkdirp(dir) {
  if (DRY_RUN) return;
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  if (DRY_RUN) {
    log.info(`Would write: ${path.relative(ROOT, filePath)}`);
    return;
  }
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyWithTransform(srcPath, destPath, transform = null) {
  if (!fileExists(srcPath)) {
    log.warn(`Source not found: ${srcPath}`);
    return false;
  }
  let content = readFile(srcPath);
  if (transform) {
    content = transform(content);
  }
  writeFile(destPath, content);
  return true;
}

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

const STEPS = [
  // Step 1: Create folder structure
  {
    id: 1,
    name: 'Create folder structure',
    run: () => {
      const folders = [
        'core', 'state', 'types', 'utils', 'persistence',
        'handlers', 'effects', 'auth', 'dock', 'layout',
        'logging', 'workspace', 'components', 'config'
      ];
      for (const folder of folders) {
        const fullPath = path.join(NXT, folder);
        mkdirp(fullPath);
        log.success(`Created nxt/${folder}/`);
      }
    }
  },

  // Step 2: Types
  {
    id: 2,
    name: 'Migrate types',
    run: () => {
      const moves = [
        { from: 'types/core.ts', to: 'types/core.types.ts' },
        { from: 'types/auth.ts', to: 'types/auth.types.ts' },
        { from: 'types/events.ts', to: 'types/events.types.ts' },
        { from: 'domains/panels/types.ts', to: 'types/panel.types.ts' },
        { from: 'types/state.ts', to: 'types/state.types.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      // Create index
      writeFile(path.join(NXT, 'types/index.ts'), `// Types barrel export
export * from './core.types';
export * from './state.types';
export * from './auth.types';
export * from './panel.types';
export * from './events.types';
`);
      log.success('Created nxt/types/index.ts');
    }
  },

  // Step 3: State
  {
    id: 3,
    name: 'Migrate state',
    run: () => {
      const moves = [
        { from: 'state/context.ts', to: 'state/context.ts' },
        { from: 'state/ui-state.ts', to: 'state/ui.state.ts' },
        { from: 'state/context-update.ts', to: 'state/context-update.utils.ts' },
        { from: 'state/state-validator.ts', to: 'state/state-validator.utils.ts' },
        { from: 'state/selectors.ts', to: 'state/selectors.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'state/index.ts'), `// State barrel export
export * from './context';
export * from './ui.state';
export * from './context-update.utils';
export * from './state-validator.utils';
export * from './selectors';
`);
      log.success('Created nxt/state/index.ts');
    }
  },

  // Step 4: Utils
  {
    id: 4,
    name: 'Migrate utils',
    run: () => {
      const moves = [
        { from: 'utils/dispatcher.ts', to: 'utils/dispatcher.ts' },
        { from: 'utils/logger.ts', to: 'utils/logger.ts' },
        { from: 'utils/helpers.ts', to: 'utils/helpers.ts' },
        { from: 'utils/expansion-helpers.ts', to: 'utils/expansion.utils.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'utils/index.ts'), `// Utils barrel export
export * from './dispatcher';
export * from './logger';
export * from './helpers';
export * from './expansion.utils';
`);
      log.success('Created nxt/utils/index.ts');
    }
  },

  // Step 5: Core
  {
    id: 5,
    name: 'Migrate core',
    run: () => {
      const moves = [
        { from: 'core/bootstrap.ts', to: 'core/bootstrap.ts' },
        { from: 'core/decorators.ts', to: 'core/decorators.ts' },
        { from: 'core/defaults.ts', to: 'core/defaults.ts' },
        { from: 'core/simple-view-config.ts', to: 'core/view-config.ts' },
        { from: 'core/built-in-views.ts', to: 'core/built-in-views.ts' },
        { from: 'core/framework-singleton.ts', to: 'core/framework-singleton.ts' },
        { from: 'core/registry/handler-registry.ts', to: 'core/handler.registry.ts' },
        { from: 'core/registry/view-registry.ts', to: 'core/view.registry.ts' },
        { from: 'core/registry/effect-registry.ts', to: 'core/effect.registry.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'core/index.ts'), `// Core barrel export
export * from './bootstrap';
export * from './decorators';
export * from './defaults';
export * from './view-config';
export * from './built-in-views';
export * from './framework-singleton';
export * from './handler.registry';
export * from './view.registry';
export * from './effect.registry';
`);
      log.success('Created nxt/core/index.ts');
    }
  },

  // Step 6: Persistence
  {
    id: 6,
    name: 'Migrate persistence',
    run: () => {
      const moves = [
        { from: 'utils/persistence.ts', to: 'persistence/local.persistence.ts' },
        { from: 'utils/firestore-persistence.ts', to: 'persistence/firestore.persistence.ts' },
        { from: 'utils/hybrid-persistence.ts', to: 'persistence/hybrid.persistence.ts' },
        { from: 'utils/framework-menu-persistence.ts', to: 'persistence/menu.persistence.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'persistence/index.ts'), `// Persistence barrel export
export * from './local.persistence';
export * from './firestore.persistence';
export * from './hybrid.persistence';
export * from './menu.persistence';
`);
      log.success('Created nxt/persistence/index.ts');
    }
  },

  // Step 7: Effects
  {
    id: 7,
    name: 'Migrate effects',
    run: () => {
      const moves = [
        { from: 'effects/auth.effects.ts', to: 'effects/auth.effect.ts' },
        { from: 'effects/preset.effects.ts', to: 'effects/preset.effect.ts' },
        { from: 'effects/framework-menu.effects.ts', to: 'effects/menu.effect.ts' },
        { from: 'effects/register.ts', to: 'effects/register.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'effects/index.ts'), `// Effects barrel export
export * from './auth.effect';
export * from './preset.effect';
export * from './menu.effect';
export * from './register';
`);
      log.success('Created nxt/effects/index.ts');
    }
  },

  // Step 8: Auth
  {
    id: 8,
    name: 'Migrate auth',
    run: () => {
      const moves = [
        { from: 'domains/auth/components/AuthView.ts', to: 'auth/auth.view.ts' },
        { from: 'utils/firebase-auth.ts', to: 'auth/auth-firebase.utils.ts' },
        { from: 'utils/auth-menu-items.ts', to: 'auth/auth-menu-items.utils.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'auth/index.ts'), `// Auth barrel export
export * from './auth.view';
export * from './auth-firebase.utils';
export * from './auth-menu-items.utils';
`);
      log.success('Created nxt/auth/index.ts');
    }
  },

  // Step 9: Dock
  {
    id: 9,
    name: 'Migrate dock',
    run: () => {
      const moves = [
        { from: 'domains/dock/components/DockContainer.ts', to: 'dock/dock-container.view.ts' },
        { from: 'domains/dock/components/DockManager.ts', to: 'dock/dock-manager.view.ts' },
        { from: 'domains/dock/components/PositionPicker.ts', to: 'dock/position-picker.view.ts' },
        { from: 'domains/dock/types.ts', to: 'dock/dock.types.ts' },
        { from: 'domains/dock/utils.ts', to: 'dock/dock.utils.ts' },
        { from: 'domains/dock/handlers/dock.handlers.ts', to: 'dock/dock.handler.ts' },
        { from: 'domains/dock/handlers/dock.ts', to: 'dock/dock-logic.utils.ts' },
        { from: 'domains/dock/handlers/positioning.ts', to: 'dock/dock-positions.utils.ts' },
        { from: 'domains/dock/handlers/position-picker.handlers.ts', to: 'dock/position-picker.handler.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'dock/index.ts'), `// Dock barrel export
export * from './dock-container.view';
export * from './dock-manager.view';
export * from './position-picker.view';
export * from './dock.types';
export * from './dock.utils';
export * from './dock.handler';
`);
      log.success('Created nxt/dock/index.ts');
    }
  },

  // Step 10: Layout
  {
    id: 10,
    name: 'Migrate layout',
    run: () => {
      const moves = [
        { from: 'domains/layout/components/FrameworkMenu.ts', to: 'layout/menu.view.ts' },
        { from: 'domains/layout/components/CustomToolbar.ts', to: 'layout/admin-toolbar.view.ts' },
        { from: 'domains/layout/components/ToolbarContainer.ts', to: 'layout/toolbar-container.view.ts' },
        { from: 'domains/layout/components/ViewRegistryPanel.ts', to: 'layout/view-palette.view.ts' },
        { from: 'domains/layout/components/SavePresetContent.ts', to: 'layout/save-preset.view.ts' },
        { from: 'domains/layout/components/LoadPresetContent.ts', to: 'layout/load-preset.view.ts' },
        { from: 'domains/layout/handlers/preset-manager.handlers.ts', to: 'layout/preset-manager.handler.ts' },
        { from: 'domains/layout/handlers/framework-menu.handlers.ts', to: 'layout/menu.handler.ts' },
        { from: 'domains/layout/handlers/view-instances.ts', to: 'layout/view-instances.handler.ts' },
        { from: 'domains/layout/handlers/views.ts', to: 'layout/views.handler.ts' },
        { from: 'domains/layout/handlers/drag.handlers.ts', to: 'layout/drag.handler.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'layout/index.ts'), `// Layout barrel export
export * from './menu.view';
export * from './admin-toolbar.view';
export * from './toolbar-container.view';
export * from './view-palette.view';
export * from './save-preset.view';
export * from './load-preset.view';
export * from './preset-manager.handler';
export * from './menu.handler';
export * from './view-instances.handler';
export * from './views.handler';
export * from './drag.handler';
`);
      log.success('Created nxt/layout/index.ts');
    }
  },

  // Step 11: Logging
  {
    id: 11,
    name: 'Migrate logging',
    run: () => {
      const moves = [
        { from: 'domains/logging/components/LogView.ts', to: 'logging/log.view.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'logging/index.ts'), `// Logging barrel export
export * from './log.view';
`);
      log.success('Created nxt/logging/index.ts');
    }
  },

  // Step 12: Workspace components
  {
    id: 12,
    name: 'Migrate workspace components',
    run: () => {
      const moves = [
        { from: 'domains/workspace/components/WorkspaceRoot.ts', to: 'workspace/workspace-root.view.ts' },
        { from: 'domains/workspace/components/PanelView.ts', to: 'workspace/panel.view.ts' },
        { from: 'domains/workspace/components/ToolbarView.ts', to: 'workspace/toolbar.view.ts' },
        { from: 'domains/workspace/components/OverlayLayer.ts', to: 'workspace/overlay.view.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
    }
  },

  // Step 13: Workspace handlers
  {
    id: 13,
    name: 'Migrate workspace handlers',
    run: () => {
      const moves = [
        { from: 'domains/workspace/handlers/registry.ts', to: 'workspace/register-handlers.ts' },
        { from: 'domains/workspace/handlers/workspace-panels.handlers.ts', to: 'workspace/panel-handlers.ts' },
        { from: 'domains/workspace/handlers/workspace-layout.handlers.ts', to: 'workspace/layout.handler.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'workspace/index.ts'), `// Workspace barrel export
export * from './workspace-root.view';
export * from './panel.view';
export * from './toolbar.view';
export * from './overlay.view';
export * from './register-handlers';
export * from './panel-handlers';
export * from './layout.handler';
`);
      log.success('Created nxt/workspace/index.ts');
    }
  },

  // Step 14: Components
  {
    id: 14,
    name: 'Migrate components',
    run: () => {
      const moves = [
        { from: 'components/FrameworkRoot.ts', to: 'components/framework-root.view.ts' },
        { from: 'components/ViewToken.ts', to: 'components/view-token.view.ts' },
        { from: 'components/Icons.ts', to: 'components/icons.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
      writeFile(path.join(NXT, 'components/index.ts'), `// Components barrel export
export * from './framework-root.view';
export * from './view-token.view';
export * from './icons';
`);
      log.success('Created nxt/components/index.ts');
    }
  },

  // Step 15: Config
  {
    id: 15,
    name: 'Migrate config',
    run: () => {
      const moves = [
        { from: 'config/admin-emails.example.ts', to: 'config/admin-emails.config.ts' },
      ];
      for (const m of moves) {
        if (copyWithTransform(path.join(SRC, m.from), path.join(NXT, m.to))) {
          log.success(`${m.from} -> nxt/${m.to}`);
        }
      }
    }
  },

  // Step 16: Handlers (core handlers extracted)
  {
    id: 16,
    name: 'Create handlers barrel',
    run: () => {
      // The core handlers are in handler.registry.ts
      // For now, create a barrel that re-exports
      writeFile(path.join(NXT, 'handlers/index.ts'), `// Handlers barrel export
// Core handlers are defined in core/handler.registry.ts
// This folder is for domain-specific handler organization

export {};
`);
      log.success('Created nxt/handlers/index.ts');
    }
  },

  // Step 17: Create main index.ts
  {
    id: 17,
    name: 'Create main index.ts',
    run: () => {
      // Read original index.ts and adapt
      const origIndex = path.join(SRC, 'index.ts');
      if (fileExists(origIndex)) {
        let content = readFile(origIndex);
        // Update import paths for new structure
        content = content
          .replace(/\.\/domains\/auth\/components/g, './auth')
          .replace(/\.\/domains\/dock\/components/g, './dock')
          .replace(/\.\/domains\/layout\/components/g, './layout')
          .replace(/\.\/domains\/logging\/components/g, './logging')
          .replace(/\.\/domains\/workspace\/components/g, './workspace')
          .replace(/\.\/domains\/workspace\/handlers/g, './workspace')
          .replace(/\.\/core\/registry/g, './core')
          .replace(/AuthView/g, 'auth.view')
          .replace(/FrameworkRoot/g, 'framework-root.view');

        writeFile(path.join(NXT, 'index.ts'), content);
        log.success('Created nxt/index.ts (adapted from src/index.ts)');
      } else {
        writeFile(path.join(NXT, 'index.ts'), `// Main entry point
export * from './core';
export * from './state';
export * from './types';
export * from './components';
`);
        log.success('Created nxt/index.ts (new)');
      }
    }
  },

  // Step 18: Copy vite-env.d.ts
  {
    id: 18,
    name: 'Copy vite-env.d.ts',
    run: () => {
      const src = path.join(SRC, 'vite-env.d.ts');
      if (fileExists(src)) {
        copyWithTransform(src, path.join(NXT, 'vite-env.d.ts'));
        log.success('Copied vite-env.d.ts');
      }
    }
  },

  // Step 19: Verify structure
  {
    id: 19,
    name: 'Verify structure',
    run: () => {
      const expectedDirs = [
        'core', 'state', 'types', 'utils', 'persistence',
        'handlers', 'effects', 'auth', 'dock', 'layout',
        'logging', 'workspace', 'components', 'config'
      ];
      let ok = true;
      for (const dir of expectedDirs) {
        const dirPath = path.join(NXT, dir);
        if (fileExists(dirPath)) {
          const files = fs.readdirSync(dirPath);
          log.success(`nxt/${dir}/ - ${files.length} files`);
        } else {
          log.error(`Missing: nxt/${dir}/`);
          ok = false;
        }
      }
      if (ok) {
        log.success('All directories verified');
      }
    }
  },

  // Step 20: Generate file count report
  {
    id: 20,
    name: 'Generate report',
    run: () => {
      let total = 0;
      const report = [];

      function countFiles(dir, prefix = '') {
        if (!fileExists(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            countFiles(path.join(dir, entry.name), prefix + entry.name + '/');
          } else if (entry.name.endsWith('.ts')) {
            total++;
            report.push(prefix + entry.name);
          }
        }
      }

      countFiles(NXT);

      log.info(`Total TypeScript files in nxt/: ${total}`);

      // Write report
      writeFile(
        path.join(ROOT, 'migration-report.txt'),
        `Migration Report\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `Total files: ${total}\n\n` +
        `Files:\n${report.map(f => '  ' + f).join('\n')}\n`
      );
      log.success('Generated migration-report.txt');
    }
  },

  // Step 21: Summary
  {
    id: 21,
    name: 'Migration complete',
    run: () => {
      console.log('\n========================================');
      console.log('  Migration to nxt/ Complete!');
      console.log('========================================\n');
      console.log('Next steps:');
      console.log('1. Review files in nxt/');
      console.log('2. Update imports in nxt/ files to use relative paths');
      console.log('3. Create tsconfig for nxt/: npx tsc -p tsconfig.nxt.json --noEmit');
      console.log('4. When ready, swap: mv src src.old && mv nxt src');
      console.log('');
    }
  },
];

// ============================================================================
// MAIN
// ============================================================================
function main() {
  console.log('\n========================================');
  console.log('  Framework Migration Script v2');
  console.log('  Target: nxt/ (preserves src/)');
  console.log('========================================\n');

  if (DRY_RUN) {
    log.warn('DRY RUN MODE - No files will be modified\n');
  }

  const progress = loadProgress();

  if (progress.completedSteps.length > 0) {
    log.info(`Resuming from previous run (${progress.completedSteps.length} steps completed)`);
    log.info(`Completed: ${progress.completedSteps.join(', ')}\n`);
  }

  for (const step of STEPS) {
    // Skip if running single step and this isn't it
    if (SINGLE_STEP !== null && step.id !== SINGLE_STEP) {
      continue;
    }

    // Skip if already completed (unless running single step)
    if (SINGLE_STEP === null && isStepComplete(progress, step.id)) {
      log.skip(`Step ${step.id}: ${step.name} (already completed)`);
      continue;
    }

    console.log(`\n--- Step ${step.id}: ${step.name} ---\n`);

    try {
      step.run();
      markStepComplete(progress, step.id);
      log.success(`Step ${step.id} completed`);
    } catch (err) {
      log.error(`Step ${step.id} failed: ${err.message}`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log('\n========================================');
  console.log(`  Progress: ${progress.completedSteps.length}/${STEPS.length} steps`);
  console.log('========================================\n');
}

main();
