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
import type { ProjectSchema } from 'openapi';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';
import { ProjectLastSeen } from './ProjectLastSeen/ProjectLastSeen.tsx';

const StyledSubtitle = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledNewProjectCardContent = styled(StyledProjectCardContent)(
    ({ theme }) => ({
        marginTop: theme.spacing(2),
    }),
);

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
                        <StyledSubtitle data-loading>
                            {featureCount === 1
                                ? `${featureCount} flag`
                                : `${featureCount} flags`}
                        </StyledSubtitle>
                    </StyledProjectCardTitleContainer>
                    <ProjectModeBadge mode={mode} />
                    <FavoriteAction id={id} isFavorite={favorite} />
                </StyledProjectCardHeader>
                <StyledNewProjectCardContent>
                    <div data-loading>
                        <ProjectLastSeen date={lastReportedFlagUsage} />
                    </div>
                </StyledNewProjectCardContent>
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
        </StyledProjectCard>
    );
};
