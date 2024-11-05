import { Typography, styled } from '@mui/material';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import {
    type ReactNode,
    useMemo,
    type FC,
    type PropsWithChildren,
} from 'react';
import UsersIcon from '@mui/icons-material/Group';
import { Link } from 'react-router-dom';
import ApiKeyIcon from '@mui/icons-material/Key';
import SegmentsIcon from '@mui/icons-material/DonutLarge';
import ConnectedIcon from '@mui/icons-material/Cable';

const Wrapper = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.envAccordion.expanded,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
    minWidth: '300px',
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
    '@container (max-width: 400px)': css,
    '@supports not (container-type: inline-size)': {
        '@media (max-width: 400px)': css,
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
            <span>{children}</span>
        </ItemContent>
        <Link to={linkUrl}>{linkText}</Link>
    </ListItemRow>
);

export const ProjectResources = () => {
    const projectId = useRequiredPathParam('projectId');
    const { project, loading: loadingProject } = useProjectOverview(projectId);
    const { tokens, loading: loadingTokens } = useProjectApiTokens(projectId);
    const { segments, loading: loadingSegments } = useSegments();
    // todo: add sdk connections

    const segmentCount = useMemo(
        () =>
            segments?.filter((segment) => segment.project === projectId)
                .length ?? 0,
        [segments, projectId],
    );

    return (
        <Wrapper>
            <ProjectResourcesInner>
                <Typography variant='h3' sx={{ margin: 0 }}>
                    Project Resources
                </Typography>
                <ResourceList>
                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/access`}
                        linkText='Add members'
                        icon={<UsersIcon />}
                    >
                        {project.members} project member(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/api-access`}
                        linkText='Add new key'
                        icon={<ApiKeyIcon />}
                    >
                        {tokens.length} API key(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/placeholder`}
                        linkText='View connections'
                        icon={<ConnectedIcon />}
                    >
                        1 connected environment(s)
                    </ListItem>

                    <ListItem
                        linkUrl={`/projects/${projectId}/settings/segments`}
                        linkText='Add segments'
                        icon={<SegmentsIcon />}
                    >
                        {segmentCount} project segment(s)
                    </ListItem>
                </ResourceList>
            </ProjectResourcesInner>
        </Wrapper>
    );
};
