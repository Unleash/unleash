import type { ComponentProps, ReactNode } from 'react';
import { Stack } from '@mui/material';
import { hasAccess } from 'component/providers/AccessProvider/AccessProvider';
import {
    ADMIN,
    CREATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { useAuthPermissions } from 'hooks/api/getters/useAuth/useAuthPermissions';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUserRecentFlags } from 'hooks/api/getters/useUserRecentFlags/useUserRecentFlags';
import { useRemoteMcpSettings } from 'hooks/api/getters/useRemoteMcpSettings/useRemoteMcpSettings';
import { useUiFlag } from 'hooks/useUiFlag';
import { basePath } from 'utils/formatPath';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId.ts';
import { GettingStartedBanner } from './GettingStartedBanner/GettingStartedBanner.tsx';
import { NewToUnleashBanner } from './NewToUnleashBanner/NewToUnleashBanner.tsx';
import { OnboardingResources } from './OnboardingResources/OnboardingResources.tsx';
import { RECENT_FLAGS_LIMIT } from './RecentFlagsPanel.tsx';

const AdminGettingStartedBanner = (
    props: ComponentProps<typeof GettingStartedBanner>,
) => {
    const { settings, loading, error } = useRemoteMcpSettings();
    return (
        <GettingStartedBanner
            {...props}
            promptContext={{
                ...props.promptContext,
                remoteMcpEnabled:
                    loading || error ? undefined : settings.enabled,
            }}
        />
    );
};

export const DashboardOnboarding = ({ children }: { children?: ReactNode }) => {
    const aiSetup = useUiFlag('dashboardOnboardingAI');
    const { permissions, error: permissionsError } = useAuthPermissions();
    const {
        projects,
        loading: projectsLoading,
        error: projectsError,
    } = useProjects();
    const { flags, error: flagsError } = useUserRecentFlags({
        limit: `${RECENT_FLAGS_LIMIT}`,
    });
    const {
        uiConfig,
        isOss,
        loading: configLoading,
        error: configError,
    } = useUiConfig();

    if (!permissions || !flags || projectsLoading || configLoading) {
        return children;
    }
    if (permissionsError || flagsError || projectsError || configError) {
        return children;
    }

    const writableProjects = projects.filter((project) =>
        hasAccess(permissions, CREATE_FEATURE, project.id),
    );
    const canCreateFlags = writableProjects.length > 0;
    const hasRecentFlags = flags.length > 0;

    if (!hasRecentFlags && !canCreateFlags) {
        return (
            <>
                <NewToUnleashBanner />
                {children}
            </>
        );
    }

    const hasEvaluatedRecentFlags = flags.some((flag) =>
        flag.environments?.some(
            (environment) =>
                Boolean(environment.lastSeenAt) ||
                (environment.yes ?? 0) > 0 ||
                (environment.no ?? 0) > 0,
        ),
    );

    if (!canCreateFlags || hasEvaluatedRecentFlags) {
        return children;
    }

    const project =
        writableProjects.find(({ id }) => id === DEFAULT_PROJECT_ID) ??
        writableProjects[0];
    const oss = isOss();
    const aiEnabled = typeof aiSetup === 'boolean' ? aiSetup : aiSetup.enabled;
    const Banner =
        aiEnabled && !oss && hasAccess(permissions, ADMIN)
            ? AdminGettingStartedBanner
            : GettingStartedBanner;

    return (
        <Stack spacing={2}>
            <Banner
                instanceUrl={`${window.location.origin}${uiConfig.baseUriPath ?? basePath}`}
                projectId={project.id}
                promptContext={{
                    permissions,
                    isOss: oss,
                    version:
                        uiConfig.versionInfo?.current.enterprise ||
                        uiConfig.versionInfo?.current.oss,
                }}
            />
            <OnboardingResources edition={oss ? 'oss' : 'enterprise'} />
        </Stack>
    );
};
