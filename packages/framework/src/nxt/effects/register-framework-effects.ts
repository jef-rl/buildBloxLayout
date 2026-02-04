import type { EffectDefDto } from '../definitions/dto/effect-def.dto';
import type { EffectImplRegistry } from '../runtime/registries/effects/effect-impl-registry';
import type { EffectRegistry } from '../runtime/registries/effects/effect-registry';
import { ActionCatalog } from '../runtime/actions/action-catalog';
import { authGoogleLoginEffect, authGoogleLoginImplKey } from './auth/google-login.effect';
import { authLoginEffect, authLoginImplKey } from './auth/login.effect';
import { authLogoutEffect, authLogoutImplKey } from './auth/logout.effect';
import { authPasswordResetEffect, authPasswordResetImplKey } from './auth/password-reset.effect';
import { authSignupEffect, authSignupImplKey } from './auth/signup.effect';
import { frameworkMenuHydrateEffect, frameworkMenuHydrateImplKey } from './framework/menu/hydrate.effect';
import { frameworkMenuSaveEffect, frameworkMenuSaveImplKey } from './framework/menu/save.effect';
import { presetsDeleteEffect, presetsDeleteImplKey } from './presets/delete.effect';
import { presetsHydrateEffect, presetsHydrateImplKey } from './presets/hydrate.effect';
import { presetsRenameEffect, presetsRenameImplKey } from './presets/rename.effect';
import { presetsSaveEffect, presetsSaveImplKey } from './presets/save.effect';

export const frameworkEffectDefs: EffectDefDto[] = [
  {
    id: 'effect:auth/login-requested',
    forAction: ActionCatalog.AuthLoginRequested,
    implKey: authLoginImplKey,
    description: 'Handle email/password login.',
  },
  {
    id: 'effect:auth/signup-requested',
    forAction: ActionCatalog.AuthSignupRequested,
    implKey: authSignupImplKey,
    description: 'Handle email/password signup.',
  },
  {
    id: 'effect:auth/google-login-requested',
    forAction: ActionCatalog.AuthGoogleLoginRequested,
    implKey: authGoogleLoginImplKey,
    description: 'Handle Google login.',
  },
  {
    id: 'effect:auth/password-reset-requested',
    forAction: ActionCatalog.AuthPasswordResetRequested,
    implKey: authPasswordResetImplKey,
    description: 'Handle password reset email.',
  },
  {
    id: 'effect:auth/logout-requested',
    forAction: ActionCatalog.AuthLogoutRequested,
    implKey: authLogoutImplKey,
    description: 'Handle logout and UI cleanup.',
  },
  {
    id: 'effect:presets/save',
    forAction: ActionCatalog.EffectsPresetsSave,
    implKey: presetsSaveImplKey,
    description: 'Persist preset updates.',
  },
  {
    id: 'effect:presets/delete',
    forAction: ActionCatalog.EffectsPresetsDelete,
    implKey: presetsDeleteImplKey,
    description: 'Delete stored presets.',
  },
  {
    id: 'effect:presets/rename',
    forAction: ActionCatalog.EffectsPresetsRename,
    implKey: presetsRenameImplKey,
    description: 'Rename stored presets.',
  },
  {
    id: 'effect:presets/hydrate',
    forAction: ActionCatalog.EffectsPresetsHydrate,
    implKey: presetsHydrateImplKey,
    description: 'Hydrate presets from persistence.',
  },
  {
    id: 'effect:framework-menu/save',
    forAction: ActionCatalog.EffectsFrameworkMenuSave,
    implKey: frameworkMenuSaveImplKey,
    description: 'Persist framework menu configuration.',
  },
  {
    id: 'effect:framework-menu/hydrate',
    forAction: ActionCatalog.EffectsFrameworkMenuHydrate,
    implKey: frameworkMenuHydrateImplKey,
    description: 'Hydrate framework menu configuration.',
  },
];

export const registerFrameworkEffectImpls = (impls: EffectImplRegistry): void => {
  impls.register(authLoginImplKey, authLoginEffect);
  impls.register(authSignupImplKey, authSignupEffect);
  impls.register(authGoogleLoginImplKey, authGoogleLoginEffect);
  impls.register(authPasswordResetImplKey, authPasswordResetEffect);
  impls.register(authLogoutImplKey, authLogoutEffect);
  impls.register(presetsSaveImplKey, presetsSaveEffect);
  impls.register(presetsDeleteImplKey, presetsDeleteEffect);
  impls.register(presetsRenameImplKey, presetsRenameEffect);
  impls.register(presetsHydrateImplKey, presetsHydrateEffect);
  impls.register(frameworkMenuSaveImplKey, frameworkMenuSaveEffect);
  impls.register(frameworkMenuHydrateImplKey, frameworkMenuHydrateEffect);
};

export const applyFrameworkEffectDefs = (registry: EffectRegistry): void => {
  frameworkEffectDefs.forEach((def) => registry.applyDefinition(def));
};
