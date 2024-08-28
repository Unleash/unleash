import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledProjectCard,
    StyledDivHeader,
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

const StyledUpdated = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledCount = styled('strong')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
}));

const StyledInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1),
    fontSize: theme.fontSizes.smallerBody,
    alignItems: 'flex-end',
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
    lastUpdatedAt,
    lastReportedFlagUsage,
}: IProjectCard) => (
    <StyledProjectCard onMouseEnter={onHover}>
        <StyledProjectCardBody>
            <StyledDivHeader>
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
                        {name}
                    </StyledCardTitle>
                    <ConditionallyRender
                        condition={Boolean(lastUpdatedAt)}
                        show={
                            <StyledUpdated>
                                Updated <TimeAgo date={lastUpdatedAt} />
                            </StyledUpdated>
                        }
                    />
                </Box>
                <ProjectModeBadge mode={mode} />
                <FavoriteAction id={id} isFavorite={favorite} />
            </StyledDivHeader>
            <StyledInfo>
                <div>
                    <div>
                        <StyledCount>{featureCount}</StyledCount> flag
                        {featureCount === 1 ? '' : 's'}
                    </div>
                    <div>
                        <StyledCount>{health}%</StyledCount> health
                    </div>
                </div>
                <ProjectLastSeen date={lastReportedFlagUsage} />
            </StyledInfo>
        </StyledProjectCardBody>
        <ProjectCardFooter id={id} owners={owners} memberCount={memberCount} />
    </StyledProjectCard>
);
