import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledCardTitle,
    StyledDivInfo,
    StyledParagraphInfo,
    StyledProjectCardBody,
    StyledIconBox,
} from './NewProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import { ProjectOwners } from './ProjectOwners/ProjectOwners';
import type { ProjectSchemaOwners } from 'openapi';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { formatDateYMD } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { parseISO } from 'date-fns';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IProjectArchiveCardProps {
    id: string;
    name: string;
    createdAt?: string;
    archivedAt?: string;
    featureCount: number;
    onHover?: () => void;
    mode: string;
    owners?: ProjectSchemaOwners;
}

export const ProjectArchiveCard = ({
    id,
    name,
    createdAt,
    archivedAt,
    featureCount = 0,
    onHover = () => {},
    mode,
    owners,
}: IProjectArchiveCardProps) => {
    const { locationSettings } = useLocationSettings();
    return (
        <StyledProjectCard onMouseEnter={onHover} disabled>
            <StyledProjectCardBody>
                <StyledDivHeader>
                    <StyledIconBox>
                        <ProjectIcon color='action' />
                    </StyledIconBox>
                    <StyledBox data-loading>
                        <StyledCardTitle>{name}</StyledCardTitle>
                    </StyledBox>
                    <ProjectModeBadge mode={mode} />
                </StyledDivHeader>
                <StyledDivInfo>
                    <ConditionallyRender
                        condition={Boolean(createdAt)}
                        show={
                            <div>
                                <StyledParagraphInfo disabled data-loading>
                                    {formatDateYMD(
                                        parseISO(createdAt as string),
                                        locationSettings.locale,
                                    )}
                                </StyledParagraphInfo>
                                <p data-loading>created</p>
                            </div>
                        }
                    />
                    <div>
                        <StyledParagraphInfo disabled data-loading>
                            {featureCount}
                        </StyledParagraphInfo>
                        <p data-loading>
                            {featureCount === 1 ? 'flag' : 'flags'}
                        </p>
                    </div>
                    <ConditionallyRender
                        condition={Boolean(archivedAt)}
                        show={
                            <div>
                                <StyledParagraphInfo disabled data-loading>
                                    {formatDateYMD(
                                        parseISO(archivedAt as string),
                                        locationSettings.locale,
                                    )}
                                </StyledParagraphInfo>
                                <p data-loading>archived</p>
                            </div>
                        }
                    />
                </StyledDivInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter id={id} showFavorite={false}>
                <ProjectOwners owners={owners} />
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
