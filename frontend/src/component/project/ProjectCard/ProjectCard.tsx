import {
    StyledProjectCard,
    StyledCardTitle,
    StyledProjectCardBody,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter.tsx';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge.tsx';
import { FavoriteAction } from './FavoriteAction/FavoriteAction.tsx';
import { Box, styled } from '@mui/material';
import { flexColumn, flexRow } from 'themes/themeStyles';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen.tsx';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ProjectMembers } from './ProjectCardFooter/ProjectMembers/ProjectMembers.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import type { ProjectSchema } from 'openapi';

const StyledUpdated = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledCount = styled('strong')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
}));

const StyledInfo = styled('div')(({ theme }) => ({
    ...flexColumn,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledContent = styled('div')({
    ...flexRow,
    justifyContent: 'space-between',
});

const StyledHeader = styled('div')(({ theme }) => ({
    gap: theme.spacing(1),
    display: 'flex',
    width: '100%',
    alignItems: 'center',
}));

type ProjectCardProps = ProjectSchema & { onHover?: () => void };

export const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount = 0,
    onHover,
    id,
    mode,
    favorite = false,
    owners,
    createdAt,
    lastUpdatedAt,
    lastReportedFlagUsage,
}: ProjectCardProps) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <StyledProjectCard onMouseEnter={onHover}>
            <StyledProjectCardBody>
                <StyledHeader>
                    <Box
                        data-loading
                        sx={(theme) => ({
                            ...flexColumn,
                            margin: theme.spacing(1, 'auto', 1, 0),
                        })}
                    >
                        <StyledCardTitle lines={1} sx={{ margin: 0 }}>
                            <Highlighter search={searchQuery}>
                                {name}
                            </Highlighter>
                        </StyledCardTitle>
                        <StyledUpdated>
                            Updated{' '}
                            <TimeAgo date={lastUpdatedAt || createdAt} />
                        </StyledUpdated>
                    </Box>
                    <ProjectModeBadge mode={mode} />
                    <FavoriteAction id={id} isFavorite={favorite} />
                </StyledHeader>
                <StyledInfo>
                    <div data-loading>
                        <StyledCount>{featureCount}</StyledCount> flag
                        {featureCount === 1 ? '' : 's'}
                    </div>
                    <StyledContent>
                        <div data-loading>
                            <StyledCount>{health}%</StyledCount> health
                        </div>
                        <div data-loading>
                            <ProjectLastSeen date={lastReportedFlagUsage} />
                        </div>
                    </StyledContent>
                </StyledInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter id={id} owners={owners}>
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={<ProjectMembers count={memberCount} members={[]} />}
                />
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
