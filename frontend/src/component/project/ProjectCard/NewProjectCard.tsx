import {
    StyledProjectCardTitle,
    StyledProjectCard,
    StyledProjectCardBody,
    StyledProjectCardHeader,
    StyledProjectCardTitleContainer,
    StyledProjectCardContent,
    StyledSubtitle,
} from './ProjectCard.styles';
import { NewProjectCardFooter } from './NewProjectCardFooter.tsx';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge.tsx';
import { FavoriteAction } from './FavoriteAction/FavoriteAction.tsx';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen.tsx';
import { OnboardingStatusBadge } from './OnboardingStatusBadge/OnboardingStatusBadge.tsx';
import type { ProjectListItem } from 'hooks/api/getters/useProjects/useProjects.ts';
import { ProjectPeople } from './ProjectCardFooter/ProjectPeople/ProjectPeople.tsx';

const StyledNewProjectCard = styled(StyledProjectCard)(({ theme }) => ({
    minHeight: theme.spacing(23),
}));

export const NewProjectCard = ({
    name,
    featureCount,
    cleanupCount,
    memberCount = 0,
    id,
    mode,
    favorite = false,
    owners,
    createdAt,
    lastUpdatedAt,
    lastReportedFlagUsage,
    onboardingStatus,
}: ProjectListItem) => {
    const { searchQuery } = useSearchHighlightContext();
    const isOnboardingInProgress =
        onboardingStatus && onboardingStatus?.status !== 'onboarded';

    return (
        <StyledNewProjectCard>
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
                        <StyledSubtitle data-loading>
                            <span>
                                {featureCount === 1
                                    ? `${featureCount} flag`
                                    : `${featureCount} flags`}
                            </span>
                            {Boolean(cleanupCount) && (
                                <span> &middot; {cleanupCount} in cleanup</span>
                            )}
                        </StyledSubtitle>
                    </StyledProjectCardTitleContainer>
                    <ProjectModeBadge mode={mode} />
                    <FavoriteAction id={id} isFavorite={favorite} />
                </StyledProjectCardHeader>
                <StyledProjectCardContent>
                    {isOnboardingInProgress ? (
                        <OnboardingStatusBadge
                            onboardingStatus={onboardingStatus}
                        />
                    ) : (
                        <div data-loading>
                            <ProjectLastSeen date={lastReportedFlagUsage} />
                        </div>
                    )}
                </StyledProjectCardContent>
            </StyledProjectCardBody>
            <NewProjectCardFooter
                lastUpdatedAt={lastUpdatedAt}
                createdAt={createdAt}
            >
                <ProjectPeople owners={owners} total={memberCount} />
            </NewProjectCardFooter>
        </StyledNewProjectCard>
    );
};
