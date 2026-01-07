import {
    StyledProjectCardTitle,
    StyledProjectCard,
    StyledProjectCardBody,
    StyledProjectCardHeader,
    StyledProjectCardContent,
    StyledProjectCardTitleContainer,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter.tsx';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge.tsx';
import { FavoriteAction } from './FavoriteAction/FavoriteAction.tsx';
import { styled } from '@mui/material';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen.tsx';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ProjectMembers } from './ProjectCardFooter/ProjectMembers/ProjectMembers.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import type { ProjectSchema } from 'openapi';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';

const StyledSubtitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

export const ProjectCard = ({
    name,
    featureCount,
    health,
    technicalDebt,
    memberCount = 0,
    id,
    mode,
    favorite = false,
    owners,
    createdAt,
    lastUpdatedAt,
    lastReportedFlagUsage,
}: ProjectSchema) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <StyledProjectCard>
            <StyledProjectCardBody>
                <StyledProjectCardHeader>
                    <StyledProjectCardTitleContainer data-loading>
                        <Truncator
                            title={name}
                            arrow
                            component={StyledProjectCardTitle}
                        >
                            <Highlighter search={searchQuery}>
                                {name}
                            </Highlighter>
                        </Truncator>
                        <StyledSubtitle>
                            Updated{' '}
                            <TimeAgo date={lastUpdatedAt || createdAt} />
                        </StyledSubtitle>
                    </StyledProjectCardTitleContainer>
                    <ProjectModeBadge mode={mode} />
                    <FavoriteAction id={id} isFavorite={favorite} />
                </StyledProjectCardHeader>
                <div>
                    <StyledProjectCardContent>
                        <div data-loading>
                            <strong>{featureCount}</strong> flag
                            {featureCount === 1 ? '' : 's'}
                        </div>
                    </StyledProjectCardContent>
                    <StyledProjectCardContent>
                        <div data-loading>
                            <strong>{technicalDebt}%</strong> technical debt
                        </div>
                        <div data-loading>
                            <ProjectLastSeen date={lastReportedFlagUsage} />
                        </div>
                    </StyledProjectCardContent>
                </div>
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
