import type { EffectDefDto } from '../definitions/dto/effect-def.dto';
import type { EffectImplRegistry } from '../runtime/registries/effects/effect-impl-registry';
import type { EffectRegistry } from '../runtime/registries/effects/effect-registry';
import { authGoogleLoginEffect, authGoogleLoginImplKey } from './auth/google-login.effect';
import { authLoginEffect, authLoginImplKey } from './auth/login.effect';
import { authLogoutEffect, authLogoutImplKey } from './auth/logout.effect';
import { authLogoutTriggerEffect, authLogoutTriggerImplKey } from './auth/logout-trigger.effect';
import { authPasswordResetEffect, authPasswordResetImplKey } from './auth/password-reset.effect';
import { authSignupEffect, authSignupImplKey } from './auth/signup.effect';
import { frameworkMenuHydrateEffect, frameworkMenuHydrateImplKey } from './framework-menu/hydrate.effect';
import { frameworkMenuSaveEffect, frameworkMenuSaveImplKey } from './framework-menu/save.effect';
import { presetsDeleteEffect, presetsDeleteImplKey } from './presets/delete.effect';
import { presetsHydrateEffect, presetsHydrateImplKey } from './presets/hydrate.effect';
import { presetsRenameEffect, presetsRenameImplKey } from './presets/rename.effect';
import { presetsSaveEffect, presetsSaveImplKey } from './presets/save.effect';

export const frameworkEffectDefs: EffectDefDto[] = [
  {
    id: 'effect:auth/login-requested',
    forAction: 'auth/loginRequested',
    implKey: authLoginImplKey,
    description: 'Handle email/password login.',
  },
  {
    id: 'effect:auth/signup-requested',
    forAction: 'auth/signupRequested',
    implKey: authSignupImplKey,
    description: 'Handle email/password signup.',
  },
  {
    id: 'effect:auth/google-login-requested',
    forAction: 'auth/googleLoginRequested',
    implKey: authGoogleLoginImplKey,
    description: 'Handle Google login.',
  },
  {
    id: 'effect:auth/password-reset-requested',
    forAction: 'auth/passwordResetRequested',
    implKey: authPasswordResetImplKey,
    description: 'Handle password reset email.',
  },
  {
    id: 'effect:auth/logout-requested',
    forAction: 'auth/logoutRequested',
    implKey: authLogoutImplKey,
    description: 'Handle logout and UI cleanup.',
  },
  {
    id: 'effect:auth/logout-trigger',
    forAction: 'effects/auth/logout',
    implKey: authLogoutTriggerImplKey,
    description: 'Trigger logout request action.',
  },
  {
    id: 'effect:presets/save',
    forAction: 'effects/presets/save',
    implKey: presetsSaveImplKey,
    description: 'Persist preset updates.',
  },
  {
    id: 'effect:presets/delete',
    forAction: 'effects/presets/delete',
    implKey: presetsDeleteImplKey,
    description: 'Delete stored presets.',
  },
  {
    id: 'effect:presets/rename',
    forAction: 'effects/presets/rename',
    implKey: presetsRenameImplKey,
    description: 'Rename stored presets.',
  },
  {
    id: 'effect:presets/hydrate',
    forAction: 'effects/presets/hydrate',
    implKey: presetsHydrateImplKey,
    description: 'Hydrate presets from persistence.',
  },
  {
    id: 'effect:framework-menu/save',
    forAction: 'effects/frameworkMenu/save',
    implKey: frameworkMenuSaveImplKey,
    description: 'Persist framework menu configuration.',
  },
  {
    id: 'effect:framework-menu/hydrate',
    forAction: 'effects/frameworkMenu/hydrate',
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
  impls.register(authLogoutTriggerImplKey, authLogoutTriggerEffect);
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
