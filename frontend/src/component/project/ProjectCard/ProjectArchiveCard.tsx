import type { FC } from 'react';
import {
    StyledProjectCard,
    StyledDivHeader,
    StyledBox,
    StyledCardTitle,
    StyledDivInfo,
    StyledProjectCardBody,
    StyledIconBox,
    StyledActions,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge';
import type { ProjectSchemaOwners } from 'openapi';
import { ProjectIcon } from 'component/common/ProjectIcon/ProjectIcon';
import { formatDateYMDHM } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { parseISO } from 'date-fns';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Box, Link, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import Undo from '@mui/icons-material/Undo';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Delete from '@mui/icons-material/Delete';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';

export type ProjectArchiveCardProps = {
    id: string;
    name: string;
    archivedAt?: string;
    onRevive: () => void;
    onDelete: () => void;
    mode?: string;
    owners?: ProjectSchemaOwners;
};

export const ProjectArchiveCard: FC<ProjectArchiveCardProps> = ({
    id,
    name,
    archivedAt,
    onRevive,
    onDelete,
    mode,
    owners,
}) => {
    const { locationSettings } = useLocationSettings();
    const { searchQuery } = useSearchHighlightContext();

    return (
        <StyledProjectCard disabled data-testid={id}>
            <StyledProjectCardBody>
                <StyledDivHeader>
                    <StyledIconBox>
                        <ProjectIcon color='action' />
                    </StyledIconBox>
                    <StyledBox data-loading>
                        <Tooltip title={`id: ${id}`} arrow>
                            <StyledCardTitle>
                                <Highlighter search={searchQuery}>
                                    {name}
                                </Highlighter>
                            </StyledCardTitle>
                        </Tooltip>
                    </StyledBox>
                    <ProjectModeBadge mode={mode} />
                </StyledDivHeader>
                <StyledDivInfo>
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
                                    <p data-loading>
                                        Archived:{' '}
                                        <TimeAgo
                                            date={archivedAt}
                                            refresh={false}
                                        />
                                    </p>
                                </Box>
                            </Tooltip>
                        }
                    />
                    <Link
                        component={RouterLink}
                        to={`/archive?search=project%3A${encodeURI(id)}`}
                    >
                        <p>View archived flags</p>
                    </Link>
                </StyledDivInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter id={id} disabled owners={owners}>
                <StyledActions>
                    <PermissionIconButton
                        onClick={onRevive}
                        projectId={id}
                        permission={UPDATE_PROJECT}
                        tooltipProps={{ title: 'Revive project' }}
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
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
