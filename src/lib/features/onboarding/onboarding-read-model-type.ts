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

/**
 * All the values are in minutes
 */
export type ProjectOnboarding = {
    project: string;
    firstFeatureFlag: number | null;
    firstPreLive: number | null;
    firstLive: number | null;
};

export interface IOnboardingReadModel {
    getInstanceOnboardingMetrics(): Promise<InstanceOnboarding>;
    getProjectsOnboardingMetrics(): Promise<Array<ProjectOnboarding>>;
}
