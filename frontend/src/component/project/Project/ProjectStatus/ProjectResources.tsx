import { Typography, styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { ReactNode, FC, PropsWithChildren } from 'react';
import UsersIcon from '@mui/icons-material/Group';
import { Link } from 'react-router';
import ApiKeyIcon from '@mui/icons-material/Key';
import SegmentsIcon from '@mui/icons-material/DonutLarge';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import useLoading from 'hooks/useLoading';
import { HealthGridTile } from './ProjectHealthGrid.styles';
import { useEventTracker } from 'hooks/useEventTracker';

const ProjectResourcesInner = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    containerType: 'inline-size',
}));

const ItemContent = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    flexFlow: 'row nowrap',
    gap: theme.spacing(1),
    svg: {
        fill: theme.palette.primary.main,
    },
}));

const onNarrowWidget = (css: object) => ({
    '@container (max-width: 385px)': css,
    '@supports not (container-type: inline-size)': {
        '@media (max-width: 385px)': css,
    },
});

const ListItemRow = styled('li')(({ theme }) => {
    return {
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing(1),

        ...onNarrowWidget({
            flexFlow: 'column',
            alignItems: 'flex-start',
            justifyContent: 'unset',
            '& + li': {
                marginTop: theme.spacing(5),
            },
        }),
    };
});

const ResourceList = styled('ul')(({ theme }) => ({
    margin: 0,
    listStyle: 'none',
    padding: 0,
    'li + li': {
        marginTop: theme.spacing(2),
    },

    ...onNarrowWidget({
        'li + li': {
            marginTop: theme.spacing(4),
        },
    }),
}));

const ListItem: FC<
    PropsWithChildren<{
        linkUrl: string;
        linkText: string;
        icon: ReactNode;
        onLinkClick: () => void;
    }>
> = ({ children, linkUrl, linkText, icon, onLinkClick }) => (
    <ListItemRow>
        <ItemContent>
            {icon}
            <span data-loading-resources>{children}</span>
        </ItemContent>
        <Link to={linkUrl} onClick={onLinkClick}>
            {linkText}
        </Link>
    </ListItemRow>
);

const useProjectResources = (projectId: string) => {
    const { data, loading } = useProjectStatus(projectId);

    const { resources } = data ?? {
        resources: {
            members: 0,
            apiTokens: 0,
            segments: 0,
        },
    };

    return {
        resources,
        loading,
    };
};

export const ProjectResources = () => {
    const projectId = useRequiredPathParam('projectId');
    const { resources, loading } = useProjectResources(projectId);
    const { trackEvent } = useEventTracker();

    const loadingRef = useLoading(loading, '[data-loading-resources=true]');

    return (
        <HealthGridTile ref={loadingRef}>
            <ProjectResourcesInner>
                <Typography variant='h4' sx={{ margin: 0 }}>
                    Project resources
                </Typography>
                <ResourceList>
                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/access`}
                        linkText='Add members'
                        icon={<UsersIcon />}
                        onLinkClick={() =>
                            trackEvent('project-status', {
                                props: {
                                    eventType: 'add-members',
                                    action: 'clicked',
                                },
                            })
                        }
                    >
                        {resources.members} project member(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/api-access`}
                        linkText='Add new key'
                        icon={<ApiKeyIcon />}
                        onLinkClick={() =>
                            trackEvent('project-status', {
                                props: {
                                    eventType: 'add-api-key',
                                    action: 'clicked',
                                },
                            })
                        }
                    >
                        {resources.apiTokens} API key(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/segments`}
                        linkText='Add segments'
                        icon={<SegmentsIcon />}
                        onLinkClick={() =>
                            trackEvent('project-status', {
                                props: {
                                    eventType: 'add-segments',
                                    action: 'clicked',
                                },
                            })
                        }
                    >
                        {resources.segments} project segment(s)
                    </ListItem>
                </ResourceList>
            </ProjectResourcesInner>
        </HealthGridTile>
    );
};
