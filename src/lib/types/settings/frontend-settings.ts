import { IUnleashConfig } from '../option';

export const frontendSettingsKey = 'unleash.frontend';

export type FrontendSettings = Pick<IUnleashConfig, 'frontendApiOrigins'>;
