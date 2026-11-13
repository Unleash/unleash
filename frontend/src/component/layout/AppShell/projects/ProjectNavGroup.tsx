import type { FC } from 'react';
import { ButtonBase, styled } from '@mui/material';
import { Link, useLocation } from 'react-router';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { ProjectSchema } from 'openapi';
import {
    SidebarItemIcon,
    sidebarItemStyles,
} from '../sidebar/SidebarItem.styles.ts';
import { SidebarList } from '../sidebar/SidebarList.tsx';
import {
    getProjectPage,
    isInProject,
    type ProjectPage,
} from './getProjectPage.ts';

const SUB_ITEM_INDENT = 3.875;

type ExpansionState = 'open' | 'closed';

export type ProjectNavExpansion = {
    project?: ExpansionState;
    more?: ExpansionState;
};

type ProjectNavItem = { page: ProjectPage; label: string; to: string };

const StyledProjectToggle = styled(ButtonBase)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    '&[aria-current="location"]': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

const StyledLabel = styled('span')({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const StyledCaret = styled(ArrowDropDownIcon, {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
    flex: 'none',
    fontSize: theme.spacing(2),
    color: theme.palette.text.secondary,
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const StyledTrailingCaret = styled(StyledCaret)({ marginLeft: 'auto' });

const StyledSubLink = styled(Link)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    paddingLeft: theme.spacing(SUB_ITEM_INDENT),
}));

const StyledMoreButton = styled(ButtonBase)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    gap: theme.spacing(0.25),
    paddingLeft: theme.spacing(SUB_ITEM_INDENT),
    color: theme.palette.text.secondary,
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
}> = ({ project, expansion, onExpansionChange }) => {
    const { pathname } = useLocation();
    const { primary, more } = useProjectNavItems(project.id);
    const isCurrent = isInProject(pathname, project.id);
    const currentPage = getProjectPage(pathname, project.id);

    const expanded = expansion?.project
        ? expansion.project === 'open'
        : isCurrent;
    const moreExpanded = expansion?.more
        ? expansion.more === 'open'
        : more.some(({ page }) => page === currentPage);
    const items = moreExpanded ? [...primary, ...more] : primary;

    return (
        <>
            <StyledProjectToggle
                aria-current={isCurrent ? 'location' : undefined}
                aria-expanded={expanded}
                onClick={() =>
                    onExpansionChange({ project: expanded ? 'closed' : 'open' })
                }
            >
                <SidebarItemIcon>
                    <FolderOutlinedIcon />
                </SidebarItemIcon>
                <StyledLabel>{project.name}</StyledLabel>
                <StyledTrailingCaret expanded={expanded} />
            </StyledProjectToggle>
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
                    <StyledMoreButton
                        aria-expanded={moreExpanded}
                        onClick={() =>
                            onExpansionChange({
                                more: moreExpanded ? 'closed' : 'open',
                            })
                        }
                    >
                        {moreExpanded ? 'Less' : 'More'}
                        <StyledCaret expanded={moreExpanded} />
                    </StyledMoreButton>
                </SidebarList>
            ) : null}
        </>
    );
};
