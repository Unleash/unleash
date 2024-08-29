import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledCardTitle,
    StyledDivInfo,
    StyledParagraphInfo,
    StyledProjectCardBody,
    StyledIconBox,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { FavoriteAction } from './FavoriteAction/FavoriteAction';
import type { IProjectCard } from 'interfaces/project';
import { Box } from '@mui/material';

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
}: IProjectCard) => (
    <StyledProjectCard onMouseEnter={onHover}>
        <StyledProjectCardBody>
            <StyledDivHeader>
                <StyledIconBox>
                    <ProjectIcon />
                </StyledIconBox>
                <StyledBox data-loading>
                    <StyledCardTitle>{name}</StyledCardTitle>
                </StyledBox>
                <ProjectModeBadge mode={mode} />
            </StyledDivHeader>
            <StyledDivInfo>
                <div>
                    <StyledParagraphInfo data-loading>
                        {featureCount}
                    </StyledParagraphInfo>
                    <p data-loading>{featureCount === 1 ? 'flag' : 'flags'}</p>
                </div>
                <ConditionallyRender
                    condition={id !== DEFAULT_PROJECT_ID}
                    show={
                        <div>
                            <StyledParagraphInfo data-loading>
                                {memberCount}
                            </StyledParagraphInfo>
                            <p data-loading>
                                {memberCount === 1 ? 'member' : 'members'}
                            </p>
                        </div>
                    }
                />
                <div>
                    <StyledParagraphInfo data-loading>
                        {health}%
                    </StyledParagraphInfo>
                    <p data-loading>healthy</p>
                </div>
            </StyledDivInfo>
        </StyledProjectCardBody>
        <ProjectCardFooter id={id} owners={owners}>
            <Box sx={(theme) => ({ margin: theme.spacing(1, 2, 0, 0) })}>
                <FavoriteAction id={id} isFavorite={favorite} />
            </Box>
        </ProjectCardFooter>
    </StyledProjectCard>
);
