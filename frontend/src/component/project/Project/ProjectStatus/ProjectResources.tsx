import { styled } from '@mui/material';
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
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusExtraLarge,
}));

const ProjectResourcesInner = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
}));

const ItemContent = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    flexFlow: 'row nowrap',
    gap: theme.spacing(1),
    svg: {
        fill: theme.palette.primary.main,
    },
}));

const ListItemRow = styled('li')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

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

const ResourceList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
}));

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
                <Link to={`/projects/${projectId}/settings/access`}>
                    Add members
                </Link>
            ),
        },
        {
            icon: <ConnectedIcon />,
            text: '1 connected environment(s)',
            link: (
                <Link to={`/projects/${projectId}/settings/access`}>
                    Add members
                </Link>
            ),
        },
        {
            icon: <SegmentsIcon />,
            text: `${segmentCount} project segment(s)`,
            link: (
                <Link to={`/projects/${projectId}/settings/access`}>
                    Add members
                </Link>
            ),
        },
    ];

    return (
        <Wrapper>
            <ProjectResourcesInner>
                <h3>Project Resources</h3>
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
