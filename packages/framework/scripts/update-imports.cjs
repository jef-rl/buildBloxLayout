#!/usr/bin/env node
/**
 * Import Update Script
 *
 * Updates all import paths after migration
 *
 * Usage: node scripts/update-imports.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const DRY_RUN = process.argv.includes('--dry-run');

// Import path mappings (old -> new)
const IMPORT_MAPPINGS = [
  // Domains -> flat structure
  ['./domains/auth/components/AuthView', './auth/auth.view'],
  ['./domains/auth/components', './auth'],
  ['./domains/dock/components/DockContainer', './dock/dock-container.view'],
  ['./domains/dock/components/DockManager', './dock/dock-manager.view'],
  ['./domains/dock/components/PositionPicker', './dock/position-picker.view'],
  ['./domains/dock/components', './dock'],
  ['./domains/dock/handlers', './dock'],
  ['./domains/dock/types', './dock/dock.types'],
  ['./domains/dock/utils', './dock/dock.utils'],
  ['./domains/layout/components/FrameworkMenu', './layout/menu.view'],
  ['./domains/layout/components/CustomToolbar', './layout/admin-toolbar.view'],
  ['./domains/layout/components/ToolbarContainer', './layout/toolbar-container.view'],
  ['./domains/layout/components/ViewRegistryPanel', './layout/view-palette.view'],
  ['./domains/layout/components/SavePresetContent', './layout/save-preset.view'],
  ['./domains/layout/components/LoadPresetContent', './layout/load-preset.view'],
  ['./domains/layout/components/Workspace', null], // Deleted
  ['./domains/layout/components', './layout'],
  ['./domains/layout/handlers', './layout'],
  ['./domains/logging/components/LogView', './logging/log.view'],
  ['./domains/logging/components', './logging'],
  ['./domains/workspace/components/WorkspaceRoot', './workspace/workspace-root.view'],
  ['./domains/workspace/components/PanelView', './workspace/panel.view'],
  ['./domains/workspace/components/ToolbarView', './workspace/toolbar.view'],
  ['./domains/workspace/components/OverlayLayer', './workspace/overlay.view'],
  ['./domains/workspace/components', './workspace'],
  ['./domains/workspace/handlers/registry', './workspace/register-handlers'],
  ['./domains/workspace/handlers/workspace-panels.handlers', './workspace/panel-assign.handler'],
  ['./domains/workspace/handlers/workspace-layout.handlers', './workspace/layout.handler'],
  ['./domains/workspace/handlers', './workspace'],
  ['./domains/panels/types', './types/panel.types'],
  ['./domains/panels', './types'],

  // Core registry flattening
  ['./core/registry/handler-registry', './core/handler.registry'],
  ['./core/registry/view-registry', './core/view.registry'],
  ['./core/registry/effect-registry', './core/effect.registry'],
  ['./core/registry', './core'],
  ['./core/simple-view-config', './core/view-config'],
  ['./core/framework-singleton', './core/framework-singleton'],

  // Utils -> persistence
  ['./utils/firestore-persistence', './persistence/firestore.persistence'],
  ['./utils/hybrid-persistence', './persistence/hybrid.persistence'],
  ['./utils/persistence', './persistence/local.persistence'],
  ['./utils/framework-menu-persistence', './persistence/menu.persistence'],
  ['./utils/firebase-auth', './auth/auth-firebase.utils'],
  ['./utils/auth-menu-items', './auth/auth-menu-items.utils'],
  ['./utils/expansion-helpers', './utils/expansion.utils'],

  // State
  ['./state/ui-state', './state/ui.state'],
  ['./state/context-update', './state/context-update.utils'],
  ['./state/state-validator', './state/state-validator.utils'],

  // Types
  ['./types/state', './types/state.types'],
  ['./types/core', './types/core.types'],
  ['./types/auth', './types/auth.types'],
  ['./types/events', './types/events.types'],

  // Components
  ['./components/FrameworkRoot', './components/framework-root.view'],
  ['./components/ViewToken', './components/view-token.view'],
  ['./components/Icons', './components/icons'],

  // Effects
  ['./effects/auth.effects', './effects/auth-state-changed.effect'],
  ['./effects/preset.effects', './effects/preset-save.effect'],
  ['./effects/framework-menu.effects', './effects/menu-persist.effect'],

  // Config
  ['./config/admin-emails.example', './config/admin-emails.config'],
];

// Create relative path lookup
function buildMappingRegex() {
  const patterns = [];

  for (const [oldPath, newPath] of IMPORT_MAPPINGS) {
    // Match the import with various quote styles and relative path depths
    const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    patterns.push({
      // Match direct imports
      regex: new RegExp(`(['"])(\\.\\.?\\/)*${escaped.slice(2)}(['"])`, 'g'),
      oldPath,
      newPath,
    });
  }

  return patterns;
}

function updateFileImports(filePath, content) {
  let updated = content;
  let changeCount = 0;

  for (const [oldPath, newPath] of IMPORT_MAPPINGS) {
    if (newPath === null) {
      // This import should be removed (file was deleted)
      const removeRegex = new RegExp(`import\\s+.*?from\\s+['"].*?${oldPath.slice(2).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?\\n?`, 'g');
      if (removeRegex.test(updated)) {
        updated = updated.replace(removeRegex, '// REMOVED: $&\n');
        changeCount++;
      }
      continue;
    }

    // Calculate relative path from current file to new location
    const currentDir = path.dirname(filePath);
    const oldFullPath = path.resolve(currentDir, oldPath);
    const newFullPath = path.resolve(SRC, newPath.slice(2));

    // Build regex to match the old import
    const oldRelative = path.relative(currentDir, oldFullPath).replace(/\\/g, '/');
    const newRelative = path.relative(currentDir, newFullPath).replace(/\\/g, '/');

    // Normalize to start with ./
    const oldNormalized = oldRelative.startsWith('.') ? oldRelative : './' + oldRelative;
    let newNormalized = newRelative.startsWith('.') ? newRelative : './' + newRelative;

    // Remove .ts extension if present
    newNormalized = newNormalized.replace(/\.ts$/, '');

    const escaped = oldNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(['"])${escaped}(['"])`, 'g');

    if (regex.test(updated)) {
      updated = updated.replace(regex, `$1${newNormalized}$2`);
      changeCount++;
    }
  }

  return { updated, changeCount };
}

function getAllTsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
        getAllTsFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  console.log('\n========================================');
  console.log('  Import Update Script');
  console.log('========================================\n');

  if (DRY_RUN) {
    console.log('\x1b[33m[WARN]\x1b[0m DRY RUN MODE - No files will be modified\n');
  }

  const files = getAllTsFiles(SRC);
  console.log(`Found ${files.length} TypeScript files\n`);

  let totalChanges = 0;
  let filesChanged = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const { updated, changeCount } = updateFileImports(file, content);

    if (changeCount > 0) {
      const relativePath = path.relative(SRC, file);
      console.log(`\x1b[36m[UPDATE]\x1b[0m ${relativePath} (${changeCount} changes)`);
      filesChanged++;
      totalChanges += changeCount;

      if (!DRY_RUN) {
        fs.writeFileSync(file, updated);
      }
    }
  }

  console.log('\n========================================');
  console.log(`  Updated ${filesChanged} files with ${totalChanges} import changes`);
  console.log('========================================\n');

  console.log('Next steps:');
  console.log('1. Run: npx tsc --noEmit');
  console.log('2. Fix any remaining import errors manually');
  console.log('3. Delete domains/ folder when ready');
  console.log('');
}

main();
