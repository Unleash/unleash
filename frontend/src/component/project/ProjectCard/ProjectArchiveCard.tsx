import type { FC } from 'react';
import {
    StyledProjectCard,
    StyledBox,
    StyledCardTitle,
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
import { Box, Link, styled, Tooltip } from '@mui/material';
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
import { flexRow } from 'themes/themeStyles';

export type ProjectArchiveCardProps = {
    id: string;
    name: string;
    archivedAt?: string;
    onRevive: () => void;
    onDelete: () => void;
    mode?: string;
    owners?: ProjectSchemaOwners;
};

export const StyledDivHeader = styled('div')(({ theme }) => ({
    ...flexRow,
    width: '100%',
    gap: theme.spacing(1),
    minHeight: theme.spacing(6),
    marginBottom: theme.spacing(1),
}));

const StyledTitle = styled(StyledCardTitle)(({ theme }) => ({
    margin: 0,
}));

const StyledContent = styled('div')(({ theme }) => ({
    ...flexRow,
    fontSize: theme.fontSizes.smallerBody,
    justifyContent: 'space-between',
}));

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
                            <StyledTitle>
                                <Highlighter search={searchQuery}>
                                    {name}
                                </Highlighter>
                            </StyledTitle>
                        </Tooltip>
                    </StyledBox>
                    <ProjectModeBadge mode={mode} />
                </StyledDivHeader>
                <StyledContent>
                    <Tooltip
                        title={
                            archivedAt
                                ? formatDateYMDHM(
                                      parseISO(archivedAt as string),
                                      locationSettings.locale,
                                  )
                                : undefined
                        }
                        arrow
                        placement='top'
                    >
                        <Box
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                            })}
                        >
                            <p data-loading>
                                Archived:{' '}
                                <TimeAgo date={archivedAt} refresh={false} />
                            </p>
                        </Box>
                    </Tooltip>
                    <Link
                        component={RouterLink}
                        to={`/archive?search=project%3A${encodeURI(id)}`}
                    >
                        <p>View archived flags</p>
                    </Link>
                </StyledContent>
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
