import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledCardTitle,
    StyledDivInfo,
    StyledDivInfoContainer,
    StyledParagraphInfo,
    StyledProjectCardBody,
    StyledIconBox,
    StyledProjectIcon,
} from './NewProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import { ProjectOwners } from './ProjectOwners/ProjectOwners';
import type { ProjectSchemaOwners } from 'openapi';

interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    id: string;
    onHover: () => void;
    isFavorite?: boolean;
    mode: string;
    owners?: ProjectSchemaOwners;
}

export const ProjectCard = ({
    name,
    featureCount,
    health,
    memberCount,
    onHover,
    id,
    mode,
    isFavorite = false,
    owners,
}: IProjectCardProps) => (
    <StyledProjectCard onMouseEnter={onHover}>
        <StyledProjectCardBody>
            <StyledDivHeader>
                <StyledIconBox>
                    <StyledProjectIcon />
                </StyledIconBox>
                <StyledBox data-loading>
                    <StyledCardTitle>{name}</StyledCardTitle>
                </StyledBox>
                <ProjectModeBadge mode={mode} />
            </StyledDivHeader>
            <StyledDivInfo>
                <StyledDivInfoContainer>
                    <StyledParagraphInfo data-loading>
                        {featureCount}
                    </StyledParagraphInfo>
                    <p data-loading>{featureCount === 1 ? 'flag' : 'flags'}</p>
                </StyledDivInfoContainer>
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <StyledDivInfoContainer>
                            <StyledParagraphInfo data-loading>
                                {memberCount}
                            </StyledParagraphInfo>
                            <p data-loading>
                                {memberCount === 1 ? 'member' : 'members'}
                            </p>
                        </StyledDivInfoContainer>
                    }
                />
                <StyledDivInfoContainer>
                    <StyledParagraphInfo data-loading>
                        {health}%
                    </StyledParagraphInfo>
                    <p data-loading>health</p>
                </StyledDivInfoContainer>
            </StyledDivInfo>
        </StyledProjectCardBody>
        <ProjectCardFooter id={id} isFavorite={isFavorite}>
            <ProjectOwners owners={owners} />
        </ProjectCardFooter>
    </StyledProjectCard>
);
