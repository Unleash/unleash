import { type FC, type ReactNode, useLayoutEffect } from 'react';
import { ButtonBase, styled } from '@mui/material';
import { Link, useLocation } from 'react-router';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import type { ProjectSchema } from 'openapi';
import {
    SIDEBAR_ITEM_GAP,
    SIDEBAR_ITEM_PADDING_X,
    SidebarCaret,
    SidebarItemIcon,
    sidebarItemStyles,
    SUB_ITEM_INDENT,
} from '../sidebar/SidebarItem.styles.ts';
import { useActionableChangeRequests } from 'hooks/api/getters/useActionableChangeRequests/useActionableChangeRequests';
import { SidebarCountBadge } from '../sidebar/SidebarCountBadge.tsx';
import { SidebarList } from '../sidebar/SidebarList.tsx';
import { SidebarMoreToggle } from '../sidebar/SidebarMoreToggle.tsx';
import { SIDEBAR_ROW_ACTION_SIZE } from '../sidebar/SidebarRowAction.tsx';
import { getProjectPage, isInProject } from './getProjectPage.ts';
import {
    PrivateProjectIcon,
    ProtectedProjectIcon,
} from './ProjectModeIcons.tsx';
import { useProjectNavItems } from './useProjectNavItems.ts';

type ExpansionState = 'open' | 'closed';

export type ProjectNavExpansion = {
    project?: ExpansionState;
    more?: ExpansionState;
};

const StyledProjectToggle = styled(ButtonBase, {
    shouldForwardProp: (prop) => prop !== 'muteWhenNotCurrent',
})<{ muteWhenNotCurrent: boolean }>(({ theme, muteWhenNotCurrent }) => ({
    ...sidebarItemStyles(theme),
    ...(muteWhenNotCurrent
        ? {
              '&:not([aria-current])': {
                  color: theme.palette.text.secondary,
              },
          }
        : {}),
    '&[aria-current="location"]': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

// The action sits on top of the toggle rather than inside it, because a button
// can't contain another button.
const StyledRow = styled('div', {
    shouldForwardProp: (prop) => prop !== 'withAction',
})<{ withAction: boolean }>(({ theme, withAction }) =>
    withAction
        ? {
              position: 'relative',
              // Keeps the hover background while the pointer is on the action.
              '&:hover [data-toggle]': {
                  backgroundColor: theme.palette.action.hover,
              },
              '& [data-toggle]': {
                  paddingRight: theme.spacing(
                      SIDEBAR_ITEM_PADDING_X +
                          SIDEBAR_ROW_ACTION_SIZE +
                          SIDEBAR_ITEM_GAP,
                  ),
              },
              // Touch devices can't hover, so they always show the action.
              '@media (hover: hover)': {
                  '&:not(:hover):not(:focus-within)': {
                      '& [data-toggle]': {
                          paddingRight: theme.spacing(SIDEBAR_ITEM_PADDING_X),
                      },
                      '& [data-action]': { opacity: 0 },
                  },
              },
          }
        : {},
);

const StyledAction = styled('span')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: theme.spacing(SIDEBAR_ITEM_PADDING_X),
    display: 'flex',
    alignItems: 'center',
    transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const StyledLabel = styled('span')({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const StyledSubLink = styled(Link)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    paddingLeft: theme.spacing(SUB_ITEM_INDENT),
}));

// Its own component so the count is only fetched while the project is expanded.
const ActionableChangeRequestsBadge: FC<{ projectId: string }> = ({
    projectId,
}) => (
    <SidebarCountBadge
        color='neutral'
        count={useActionableChangeRequests(projectId).total}
        description='you can act on'
    />
);

export const ProjectNavGroup: FC<{
    project: Pick<ProjectSchema, 'id' | 'name' | 'mode'>;
    expansion?: ProjectNavExpansion;
    onExpansionChange: (change: ProjectNavExpansion) => void;
    muteWhenNotCurrent?: boolean;
    action?: ReactNode;
}> = ({
    project,
    expansion,
    onExpansionChange,
    muteWhenNotCurrent = false,
    action,
}) => {
    const { pathname } = useLocation();
    const { primary, more } = useProjectNavItems(project.id);
    const isCurrent = isInProject(pathname, project.id);
    const currentPage = getProjectPage(pathname, project.id);

    // Layout effect so a page load doesn't paint the project collapsed first - avoid flickering ui.
    // biome-ignore lint/correctness/useExhaustiveDependencies: runs only on navigation; re-running on expansion changes would undo collapsing the current project
    useLayoutEffect(() => {
        if (isCurrent && expansion?.project === 'closed') {
            // Cleared rather than set to 'open' so the project collapses
            // again once left, like a current project that was never toggled.
            onExpansionChange({ project: undefined });
        }
    }, [pathname]);

    const expanded = expansion?.project
        ? expansion.project === 'open'
        : isCurrent;
    const moreExpanded = expansion?.more
        ? expansion.more === 'open'
        : more.some(({ page }) => page === currentPage);
    const items = moreExpanded ? [...primary, ...more] : primary;

    return (
        <>
            <StyledRow withAction={Boolean(action)}>
                <StyledProjectToggle
                    data-toggle
                    muteWhenNotCurrent={muteWhenNotCurrent}
                    aria-current={isCurrent ? 'location' : undefined}
                    aria-expanded={expanded}
                    onClick={() =>
                        onExpansionChange({
                            project: expanded ? 'closed' : 'open',
                        })
                    }
                >
                    <SidebarItemIcon>
                        <FolderOutlinedIcon />
                    </SidebarItemIcon>
                    <StyledLabel>{project.name}</StyledLabel>
                    {project.mode === 'private' ? <PrivateProjectIcon /> : null}
                    {project.mode === 'protected' ? (
                        <ProtectedProjectIcon />
                    ) : null}
                    <SidebarCaret expanded={expanded} />
                </StyledProjectToggle>
                {action ? (
                    <StyledAction data-action>{action}</StyledAction>
                ) : null}
            </StyledRow>
            {expanded ? (
                <SidebarList role='group' aria-label={project.name}>
                    {items.map(({ page, label, to }) => (
                        <StyledSubLink
                            key={page}
                            to={to}
                            aria-current={
                                page === currentPage ? 'page' : undefined
                            }
                        >
                            {label}
                            {page === 'change-requests' ? (
                                <ActionableChangeRequestsBadge
                                    projectId={project.id}
                                />
                            ) : null}
                        </StyledSubLink>
                    ))}
                    <SidebarMoreToggle
                        variant='nested'
                        expanded={moreExpanded}
                        onToggle={() =>
                            onExpansionChange({
                                more: moreExpanded ? 'closed' : 'open',
                            })
                        }
                    />
                </SidebarList>
            ) : null}
        </>
    );
};
