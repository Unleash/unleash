import type { FC } from 'react';
import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledCardTitle,
    StyledDivInfo,
    StyledParagraphInfo,
    StyledProjectCardBody,
    StyledIconBox,
    StyledActions,
} from './NewProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import type { ProjectSchemaOwners } from 'openapi';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { formatDateYMDHM } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { parseISO } from 'date-fns';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import TimeAgo from 'react-timeago';
import { Box, Link, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    CREATE_PROJECT,
    DELETE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import Undo from '@mui/icons-material/Undo';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Delete from '@mui/icons-material/Delete';

interface IProjectArchiveCardProps {
    id: string;
    name: string;
    createdAt?: string;
    archivedAt?: string;
    featureCount: number;
    onRevive: () => void;
    onDelete: () => void;
    mode: string;
    owners?: ProjectSchemaOwners;
}

export const ProjectArchiveCard: FC<IProjectArchiveCardProps> = ({
    id,
    name,
    archivedAt,
    featureCount = 0,
    onRevive,
    onDelete,
    mode,
    owners,
}) => {
    const { locationSettings } = useLocationSettings();
    const Actions: FC<{
        id: string;
    }> = ({ id }) => (
        <StyledActions>
            <PermissionIconButton
                onClick={onRevive}
                projectId={id}
                permission={CREATE_PROJECT}
                tooltipProps={{ title: 'Restore project' }}
                data-testid={`revive-feature-flag-button`}
            >
                <Undo />
            </PermissionIconButton>
            <PermissionIconButton
                permission={DELETE_PROJECT}
                projectId={id}
                tooltipProps={{ title: 'Permanently delete project' }}
                onClick={onDelete}
            >
                <Delete />
            </PermissionIconButton>
        </StyledActions>
    );

    return (
        <StyledProjectCard disabled>
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
                    <Link
                        component={RouterLink}
                        to={`/archive?search=project%3A${encodeURI(id)}`}
                    >
                        <StyledParagraphInfo disabled data-loading>
                            {featureCount}
                        </StyledParagraphInfo>
                        <p data-loading>
                            archived {featureCount === 1 ? 'flag' : 'flags'}
                        </p>
                    </Link>
                    <ConditionallyRender
                        condition={Boolean(archivedAt)}
                        show={
                            <Tooltip
                                title={formatDateYMDHM(
                                    parseISO(archivedAt as string),
                                    locationSettings.locale,
                                )}
                                arrow
                            >
                                <Box
                                    sx={(theme) => ({
                                        color: theme.palette.text.secondary,
                                    })}
                                >
                                    <StyledParagraphInfo disabled data-loading>
                                        Archived
                                    </StyledParagraphInfo>
                                    <p data-loading>
                                        <TimeAgo
                                            date={
                                                new Date(archivedAt as string)
                                            }
                                        />
                                    </p>
                                </Box>
                            </Tooltip>
                        }
                    />
                </StyledDivInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter
                id={id}
                Actions={Actions}
                disabled
                owners={owners}
            >
                <Actions id={id} />
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
