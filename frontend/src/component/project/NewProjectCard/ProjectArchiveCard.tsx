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
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import Undo from '@mui/icons-material/Undo';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Delete from '@mui/icons-material/Delete';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';

export type ProjectArchiveCardProps = {
    id: string;
    name: string;
    archivedAt?: string;
    archivedFeaturesCount?: number;
    onRevive: () => void;
    onDelete: () => void;
    mode?: string;
    owners?: ProjectSchemaOwners;
};

export const ProjectArchiveCard: FC<ProjectArchiveCardProps> = ({
    id,
    name,
    archivedAt,
    archivedFeaturesCount,
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
                        <StyledCardTitle>
                            <Highlighter search={searchQuery}>
                                {name}
                            </Highlighter>
                        </StyledCardTitle>
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
                                    <StyledParagraphInfo disabled data-loading>
                                        Archived
                                    </StyledParagraphInfo>
                                    <p data-loading>
                                        <TimeAgo
                                            minPeriod={60}
                                            date={
                                                new Date(archivedAt as string)
                                            }
                                            live={false}
                                        />
                                    </p>
                                </Box>
                            </Tooltip>
                        }
                    />
                    <ConditionallyRender
                        condition={typeof archivedFeaturesCount !== 'undefined'}
                        show={
                            <Link
                                component={RouterLink}
                                to={`/archive?search=project%3A${encodeURI(id)}`}
                            >
                                <StyledParagraphInfo disabled data-loading>
                                    {archivedFeaturesCount}
                                </StyledParagraphInfo>
                                <p data-loading>
                                    archived{' '}
                                    {archivedFeaturesCount === 1
                                        ? 'flag'
                                        : 'flags'}
                                </p>
                            </Link>
                        }
                    />
                </StyledDivInfo>
            </StyledProjectCardBody>
            <ProjectCardFooter id={id} disabled owners={owners}>
                <StyledActions>
                    <PermissionIconButton
                        onClick={onRevive}
                        projectId={id}
                        permission={UPDATE_PROJECT}
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
            </ProjectCardFooter>
        </StyledProjectCard>
    );
};
