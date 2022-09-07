// All known splash IDs.
export const splashIds = ['operators'] as const;

// Active splash IDs that may be shown to the user.
export const activeSplashIds: SplashId[] = [];

export type SplashId = typeof splashIds[number];
