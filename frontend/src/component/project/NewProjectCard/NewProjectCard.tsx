import { Box, styled } from '@mui/material';
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
} from './NewProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import { ProjectOwners } from './ProjectOwners/ProjectOwners';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';

interface IProjectCardProps {
    name: string;
    featureCount: number;
    health: number;
    memberCount: number;
    id: string;
    onHover: () => void;
    isFavorite?: boolean;
    mode: string;
    owners?: {
        users: any[];
        groups: any[];
    };
}

const StyledProjectIcon = styled(ProjectIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

export const StyledIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(2),
}));

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
                <StyledDivInfoContainer>
                    <StyledParagraphInfo data-loading>
                        {health}%
                    </StyledParagraphInfo>
                    <p data-loading>health</p>
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
            </StyledDivInfo>
        </StyledProjectCardBody>
        <ProjectCardFooter id={id} isFavorite={isFavorite}>
            <ProjectOwners owners={owners} />
        </ProjectCardFooter>
    </StyledProjectCard>
);
