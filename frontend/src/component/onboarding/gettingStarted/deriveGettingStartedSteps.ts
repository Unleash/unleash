import type { ProjectListItem } from 'hooks/api/getters/useProjects/useProjects';

export type GettingStartedStepId =
    | 'create-flag'
    | 'enable-flag'
    | 'connect-sdk'
    | 'add-strategy'
    | 'invite-teammate';

export type GettingStartedStep = {
    id: GettingStartedStepId;
    title: string;
    href: string;
    completed: boolean;
    /**
     * Manual steps have no reliable server-side signal, so they are
     * marked as completed in localStorage when the user follows the link.
     */
    manual: boolean;
};

const FLAG_CREATED_STATUSES = [
    'first-flag-created',
    'sdk-connected',
    'onboarded',
];

const SDK_CONNECTED_STATUSES = ['sdk-connected', 'onboarded'];

const hasOnboardingStatus = (
    projects: ProjectListItem[],
    statuses: string[],
): boolean =>
    projects.some((project) =>
        statuses.includes(project.onboardingStatus?.status ?? ''),
    );

export const deriveGettingStartedSteps = ({
    projects,
    hasActiveInviteToken,
    manualSteps,
}: {
    projects: ProjectListItem[];
    hasActiveInviteToken: boolean;
    manualSteps: GettingStartedStepId[];
}): GettingStartedStep[] => {
    const targetProjectId =
        projects.find((project) => project.id === 'default')?.id ??
        projects[0]?.id ??
        'default';
    const projectPath = `/projects/${encodeURIComponent(targetProjectId)}`;

    const flagCreated =
        hasOnboardingStatus(projects, FLAG_CREATED_STATUSES) ||
        projects.some((project) => (project.featureCount ?? 0) > 0);
    const sdkConnected = hasOnboardingStatus(projects, SDK_CONNECTED_STATUSES);
    const onboarded = hasOnboardingStatus(projects, ['onboarded']);
    const teammateInvited =
        hasActiveInviteToken ||
        projects.some((project) => (project.memberCount ?? 0) > 1) ||
        manualSteps.includes('invite-teammate');

    return [
        {
            id: 'create-flag',
            title: 'Create your first feature flag',
            href: projectPath,
            completed: flagCreated,
            manual: false,
        },
        {
            id: 'enable-flag',
            title: 'Turn it on',
            href: projectPath,
            completed: onboarded,
            manual: false,
        },
        {
            id: 'connect-sdk',
            title: 'Connect an SDK',
            href: projectPath,
            completed: sdkConnected,
            manual: false,
        },
        {
            id: 'add-strategy',
            title: 'Add a targeting/rollout strategy',
            href: projectPath,
            completed: manualSteps.includes('add-strategy'),
            manual: true,
        },
        {
            id: 'invite-teammate',
            title: 'Invite a teammate',
            href: '/admin/invite-link',
            completed: teammateInvited,
            manual: true,
        },
    ];
};
