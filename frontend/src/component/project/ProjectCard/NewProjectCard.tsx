import {
    StyledProjectCardTitle,
    StyledProjectCard,
    StyledProjectCardBody,
    StyledProjectCardHeader,
    StyledProjectCardTitleContainer,
    StyledProjectCardContent,
} from './ProjectCard.styles';
import { NewProjectCardFooter } from './NewProjectCardFooter.tsx';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge.tsx';
import { FavoriteAction } from './FavoriteAction/FavoriteAction.tsx';
import { styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ProjectMembers } from './ProjectCardFooter/ProjectMembers/ProjectMembers.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen.tsx';
import { OnboardingStatusBadge } from './OnboardingStatusBadge/OnboardingStatusBadge.tsx';
import type { ProjectListItem } from 'hooks/api/getters/useProjects/useProjects.ts';

const StyledSubtitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledNewProjectCard = styled(StyledProjectCard)(({ theme }) => ({
    minHeight: theme.spacing(23),
}));

export const NewProjectCard = ({
    name,
    featureCount,
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
                            {featureCount === 1
                                ? `${featureCount} flag`
                                : `${featureCount} flags`}
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
                owners={owners}
                lastUpdatedAt={lastUpdatedAt}
                createdAt={createdAt}
            >
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={<ProjectMembers count={memberCount} members={[]} />}
                />
            </NewProjectCardFooter>
        </StyledNewProjectCard>
    );
};
