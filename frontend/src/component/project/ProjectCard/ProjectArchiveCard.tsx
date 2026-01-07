import type { FC } from 'react';
import {
    StyledProjectCard,
    StyledProjectCardTitle,
    StyledProjectCardBody,
    StyledProjectCardHeader,
    StyledProjectCardContent,
    StyledProjectCardTitleContainer,
} from './ProjectCard.styles';
import { ProjectCardFooter } from './ProjectCardFooter/ProjectCardFooter.tsx';
import { ProjectModeBadge } from './ProjectModeBadge/ProjectModeBadge.tsx';
import type { ProjectSchemaOwners } from 'openapi';
import { formatDateYMDHM } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { parseISO } from 'date-fns';
import { Box, styled, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
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
import { Truncator } from 'component/common/Truncator/Truncator.tsx';

const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

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
                    </StyledProjectCardTitleContainer>
                    <ProjectModeBadge mode={mode} />
                </StyledProjectCardHeader>
                <StyledProjectCardContent>
                    {archivedAt && (
                        <div data-loading>
                            Archived{' '}
                            <Tooltip
                                title={formatDateYMDHM(
                                    parseISO(archivedAt as string),
                                    locationSettings.locale,
                                )}
                                arrow
                            >
                                <strong>
                                    <TimeAgo
                                        date={archivedAt}
                                        refresh={false}
                                    />
                                </strong>
                            </Tooltip>
                        </div>
                    )}
                    <div data-loading>
                        <Link to={`/archive?search=project%3A${encodeURI(id)}`}>
                            View archived flags
                        </Link>
                    </div>
                </StyledProjectCardContent>
            </StyledProjectCardBody>
            <ProjectCardFooter id={id} owners={owners}>
                <StyledActions>
                    <PermissionIconButton
                        onClick={onRevive}
                        projectId={id}
                        permission={UPDATE_PROJECT}
                        tooltipProps={{ title: 'Revive project' }}
                        data-testid={`revive-feature-flag-button`}
                        size='small'
                    >
                        <Undo />
                    </PermissionIconButton>
                    <PermissionIconButton
                        permission={DELETE_PROJECT}
                        projectId={id}
                        tooltipProps={{ title: 'Permanently delete project' }}
                        onClick={onDelete}
                        size='small'
                    >
                        <Delete />
                    </PermissionIconButton>
                </StyledActions>
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
