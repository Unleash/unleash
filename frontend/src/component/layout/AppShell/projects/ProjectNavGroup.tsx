import { type FC, type ReactNode, useLayoutEffect } from 'react';
import { ButtonBase, styled } from '@mui/material';
import { Link, useLocation } from 'react-router';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectSchema } from 'openapi';
import {
    SidebarCaret,
    SidebarItemIcon,
    sidebarItemStyles,
    SUB_ITEM_INDENT,
} from '../sidebar/SidebarItem.styles.ts';
import { SidebarList } from '../sidebar/SidebarList.tsx';
import { SidebarMoreToggle } from '../sidebar/SidebarMoreToggle.tsx';
import { SIDEBAR_ROW_ACTION_SIZE } from '../sidebar/SidebarRowAction.tsx';
import {
    getProjectPage,
    isInProject,
    type ProjectPage,
} from './getProjectPage.ts';

type ExpansionState = 'open' | 'closed';

export type ProjectNavExpansion = {
    project?: ExpansionState;
    more?: ExpansionState;
};

type ProjectNavItem = { page: ProjectPage; label: string; to: string };

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
              '& [data-label]': {
                  paddingRight: theme.spacing(SIDEBAR_ROW_ACTION_SIZE),
              },
              // Touch devices can't hover, so they always show the action.
              '@media (hover: hover)': {
                  '&:not(:hover):not(:focus-within)': {
                      '& [data-label]': { paddingRight: 0 },
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
    right: theme.spacing(3),
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

const StyledTrailingCaret = styled(SidebarCaret)({ marginLeft: 'auto' });

const StyledSubLink = styled(Link)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    paddingLeft: theme.spacing(SUB_ITEM_INDENT),
}));

const useProjectNavItems = (projectId: string) => {
    const { isOss } = useUiConfig();
    const base = `/projects/${projectId}`;

    const primary: ProjectNavItem[] = [
        { page: 'flags', label: 'Flags', to: base },
        ...(isOss()
            ? []
            : [
                  {
                      page: 'change-requests' as const,
                      label: 'Change requests',
                      to: `${base}/change-requests`,
                  },
              ]),
    ];
    const more: ProjectNavItem[] = [
        { page: 'logs', label: 'Event log', to: `${base}/logs` },
        {
            page: 'settings',
            label: 'Configure project',
            to: isOss() ? `${base}/settings/api-access` : `${base}/settings`,
        },
    ];

    return { primary, more };
};

export const ProjectNavGroup: FC<{
    project: Pick<ProjectSchema, 'id' | 'name'>;
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
                    <StyledLabel data-label>{project.name}</StyledLabel>
                    <StyledTrailingCaret expanded={expanded} />
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
