import type { IUnleashConfig } from '../option.js';

export const frontendSettingsKey = 'unleash.frontend';

export type FrontendSettings = Pick<IUnleashConfig, 'frontendApiOrigins'>;
