// All known splash IDs.
export const splashIds = ['environments', 'operators'] as const;

// Active splash IDs that may be shown to the user.
export const activeSplashIds: SplashId[] = ['operators'];

export type SplashId = typeof splashIds[number];
