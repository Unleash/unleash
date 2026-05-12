// All known splash IDs.
export const splashIds = [
    'operators',
    'release-management-v3',
    'impact-metrics-safeguards',
] as const;

export type SplashId = (typeof splashIds)[number];
