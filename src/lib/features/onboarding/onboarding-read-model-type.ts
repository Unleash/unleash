/**
 * All the values are in minutes
 */
export type InstanceOnboarding = {
    firstLogin: number | null;
    secondLogin: number | null;
    firstFeatureFlag: number | null;
    firstPreLive: number | null;
    firstLive: number | null;
};

export interface IOnboardingReadModel {
    getInstanceOnboardingMetrics(): Promise<InstanceOnboarding>;
}
