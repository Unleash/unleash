import { Typography, styled } from '@mui/material';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { type FC, type ReactNode, useMemo } from 'react';
import UsersIcon from '@mui/icons-material/Group';
import { Link } from 'react-router-dom';
import ApiKeyIcon from '@mui/icons-material/Key';
import SegmentsIcon from '@mui/icons-material/DonutLarge';
import ConnectedIcon from '@mui/icons-material/Cable';

const Wrapper = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.envAccordion.expanded,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusExtraLarge,
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

const ListItemRow = styled('li')(({ theme }) => {
    const narrowListStyle = {
        flexFlow: 'column',
        alignItems: 'flex-start',
        justifyContent: 'unset',
        '& + li': {
            marginTop: theme.spacing(5),
        },
    };

    return {
        '@container (max-width: 400px)': narrowListStyle,

        '@supports not (container-type: inline-size)': {
            [theme.breakpoints.down('sm')]: narrowListStyle,
        },

        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing(1),
    };
});

const ListItem: FC<{ icon: ReactNode; text: string; link: ReactNode }> = ({
    icon,
    text,
    link,
}) => {
    return (
        <ListItemRow>
            <ItemContent>
                {icon} <span>{text}</span>
            </ItemContent>
            {link}
        </ListItemRow>
    );
};

const ResourceList = styled('ul')(({ theme }) => {
    const narrowStyles = {
        'li + li': {
            marginTop: theme.spacing(4),
        },
    };

    return {
        margin: 0,
        listStyle: 'none',
        padding: 0,
        'li + li': {
            marginTop: theme.spacing(2),
        },

        '@container (max-width: 400px)': narrowStyles,

        '@supports not (container-type: inline-size)': {
            [theme.breakpoints.down('sm')]: narrowStyles,
        },
    };
});

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

    const items = [
        {
            icon: <UsersIcon />,
            text: `${project.members} project member(s)`,
            link: (
                <Link to={`/projects/${projectId}/settings/access`}>
                    Add members
                </Link>
            ),
        },
        {
            icon: <ApiKeyIcon />,
            text: `${tokens.length} API key(s)`,
            link: (
                <Link to={`/projects/${projectId}/settings/api-access`}>
                    Add new key
                </Link>
            ),
        },
        {
            icon: <ConnectedIcon />,
            text: '1 connected environment(s)',
            link: (
                <Link to={`/projects/${projectId}/settings/placeholder`}>
                    View connections
                </Link>
            ),
        },
        {
            icon: <SegmentsIcon />,
            text: `${segmentCount} project segment(s)`,
            link: (
                <Link to={`/projects/${projectId}/settings/segments`}>
                    Add segments
                </Link>
            ),
        },
    ];

    return (
        <Wrapper>
            <ProjectResourcesInner>
                <Typography variant='h3' sx={{ margin: 0 }}>
                    Project Resources
                </Typography>
                <ResourceList>
                    {items.map((item, index) => (
                        <ListItem
                            key={index}
                            icon={item.icon}
                            text={item.text}
                            link={item.link}
                        />
                    ))}
                </ResourceList>
            </ProjectResourcesInner>
        </Wrapper>
    );
};
