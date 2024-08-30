import {
    StyledProjectCard,
    StyledCardTitle,
    StyledProjectCardBody,
    StyledIconBox,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { FavoriteAction } from './FavoriteAction/FavoriteAction';
import { Box, styled } from '@mui/material';
import { flexColumn } from 'themes/themeStyles';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen';
import type { IProjectCard } from 'interfaces/project';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

const StyledUpdated = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledCount = styled('strong')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
}));

const StyledInfo = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplate: '1rem 1rem / 1fr 1fr',
    gridAutoFlow: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    gap: theme.spacing(1),
    display: 'flex',
    width: '100%',
    alignItems: 'center',
}));

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
}: IProjectCard) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <StyledProjectCard onMouseEnter={onHover}>
            <StyledProjectCardBody>
                <StyledHeader>
                    <StyledIconBox>
                        <ProjectIcon />
                    </StyledIconBox>
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
                    <div data-loading>
                        <StyledCount>{health}%</StyledCount> health
                    </div>
                    <div />
                    <div data-loading>
                        <ProjectLastSeen date={lastReportedFlagUsage} />
                    </div>
                </StyledInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter
                id={id}
                owners={owners}
                memberCount={memberCount}
            />
        </StyledProjectCard>
    );
};
