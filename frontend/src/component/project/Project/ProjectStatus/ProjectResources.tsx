import { Typography, styled } from '@mui/material';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { ReactNode, FC, PropsWithChildren } from 'react';
import UsersIcon from '@mui/icons-material/Group';
import { Link } from 'react-router-dom';
import ApiKeyIcon from '@mui/icons-material/Key';
import SegmentsIcon from '@mui/icons-material/DonutLarge';
import ConnectedIcon from '@mui/icons-material/Cable';
import { useProjectStatus } from 'hooks/api/getters/useProjectStatus/useProjectStatus';
import useLoading from 'hooks/useLoading';

const Wrapper = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.envAccordion.expanded,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    minWidth: '300px',
    gridArea: 'resources',
}));

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
    }>
> = ({ children, linkUrl, linkText, icon }) => (
    <ListItemRow>
        <ItemContent>
            {icon}
            <span data-loading-resources>{children}</span>
        </ItemContent>
        <Link to={linkUrl}>{linkText}</Link>
    </ListItemRow>
);

const useProjectResources = (projectId: string) => {
    const { data, loading } = useProjectStatus(projectId);

    const { resources } = data ?? {
        resources: {
            members: 0,
            apiTokens: 0,
            connectedEnvironments: 0,
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

    const loadingRef = useLoading(loading, '[data-loading-resources=true]');

    return (
        <Wrapper ref={loadingRef}>
            <ProjectResourcesInner>
                <Typography variant='h4' sx={{ margin: 0 }}>
                    Project resources
                </Typography>
                <ResourceList>
                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/access`}
                        linkText='Add members'
                        icon={<UsersIcon />}
                    >
                        {resources.members} project member(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/api-access`}
                        linkText='Add new key'
                        icon={<ApiKeyIcon />}
                    >
                        {resources.apiTokens} API key(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/placeholder`}
                        linkText='View connections'
                        icon={<ConnectedIcon />}
                    >
                        {resources.connectedEnvironments} connected
                        environment(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/segments`}
                        linkText='Add segments'
                        icon={<SegmentsIcon />}
                    >
                        {resources.segments} project segment(s)
                    </ListItem>
                </ResourceList>
            </ProjectResourcesInner>
        </Wrapper>
    );
};
