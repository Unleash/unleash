import {
    StyledProjectCardTitle,
    StyledProjectCard,
    StyledProjectCardBody,
    StyledProjectCardHeader,
    StyledProjectCardTitleContainer,
    StyledProjectCardContent,
    StyledSubtitle,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter.tsx';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge.tsx';
import { FavoriteAction } from './FavoriteAction/FavoriteAction.tsx';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen.tsx';
import { OnboardingStatusBadge } from './OnboardingStatusBadge/OnboardingStatusBadge.tsx';
import type { ProjectSchema } from 'openapi';

const StyledCard = styled(StyledProjectCard)(({ theme }) => ({
    minHeight: theme.spacing(23),
}));

export const ProjectCard = ({
    name,
    featureCount,
    cleanupCount,
    memberCount = 0,
    id,
    mode,
    favorite = false,
    createdAt,
    lastUpdatedAt,
    lastReportedFlagUsage,
    onboardingStatus,
}: ProjectSchema) => {
    const { searchQuery } = useSearchHighlightContext();
    const isOnboardingInProgress =
        onboardingStatus && onboardingStatus?.status !== 'onboarded';

    return (
        <StyledCard>
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
            <ProjectCardFooter
                lastUpdatedAt={lastUpdatedAt}
                createdAt={createdAt}
                memberCount={memberCount}
            ></ProjectCardFooter>
        </StyledCard>
    );
};
