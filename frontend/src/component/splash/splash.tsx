// All known splash IDs.
export const splashIds = [
    'operators',
    'release-management',
    'release-management-v3',
] as const;

export type SplashId = (typeof splashIds)[number];
