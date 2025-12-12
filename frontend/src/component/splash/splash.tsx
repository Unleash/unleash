// All known splash IDs.
export const splashIds = ['operators', 'release-management'] as const;

// Active splash IDs that may be shown to the user.
export const activeSplashIds: SplashId[] = ['release-management'];

export type SplashId = (typeof splashIds)[number];
