import type { FC } from 'react';
import { Breadcrumbs, styled, type Theme, Tooltip } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { Truncator } from 'component/common/Truncator/Truncator';
import { ProjectModeBadge } from 'component/project/ProjectModeBadge/ProjectModeBadge';
import { type EntityPage, findEntityPage } from './entityPages.ts';
import {
    type PageBreadcrumb,
    usePageBreadcrumbs,
} from './usePageBreadcrumbs.ts';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
    minWidth: 0,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    '& > ol': {
        flexWrap: 'nowrap',
        '& > li:last-child': {
            minWidth: 0,
            color: theme.palette.text.primary,
            fontWeight: theme.typography.fontWeightBold,
        },
    },
    '& a': {
        color: 'inherit',
        '&:hover': {
            color: theme.palette.text.primary,
            textDecoration: 'none',
        },
    },
    '& .MuiBreadcrumbs-separator': {
        margin: theme.spacing(0, 0.75),
        color: theme.palette.text.disabled,
    },
}));

const breadcrumbStyles = (theme: Theme) => ({
    display: 'block',
    maxWidth: theme.spacing(25),
});

const StyledLink = styled(Link)(({ theme }) => breadcrumbStyles(theme));

const StyledText = styled('span')(({ theme }) => breadcrumbStyles(theme));

const StyledIconLink = styled(Link)({ display: 'flex' });

const StyledIconLabel = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

type BreadcrumbIcon = NonNullable<PageBreadcrumb['icon']>;

type BreadcrumbLabelProps = {
    label: string;
    icon?: BreadcrumbIcon;
    projectMode?: PageBreadcrumb['projectMode'];
};

type BreadcrumbView =
    | { kind: 'iconLink'; label: string; to: string; icon: BreadcrumbIcon }
    | ({ kind: 'link'; to: string } & BreadcrumbLabelProps)
    | ({ kind: 'current' } & BreadcrumbLabelProps)
    | ({ kind: 'plain' } & BreadcrumbLabelProps);

const toBreadcrumbView = (
    { label, to, icon, projectMode }: PageBreadcrumb,
    isLastInTrail: boolean,
    pathname: string,
): BreadcrumbView => {
    const isCollapsedToIcon = !isLastInTrail && icon !== undefined;
    const isCurrentPage = isLastInTrail && to === pathname;

    if (to === undefined) {
        return { kind: 'plain', label, icon, projectMode };
    }
    if (isCollapsedToIcon) {
        return { kind: 'iconLink', label, to, icon };
    }
    if (isCurrentPage) {
        return { kind: 'current', label, icon, projectMode };
    }
    return { kind: 'link', label, to, icon, projectMode };
};

const BreadcrumbLabel: FC<BreadcrumbLabelProps> = ({
    label,
    icon: Icon,
    projectMode,
}) => {
    const text = (
        <Truncator title={label} arrow>
            {label}
        </Truncator>
    );

    return (
        <StyledIconLabel>
            {Icon ? <Icon fontSize='small' /> : null}
            {text}
            <ProjectModeBadge mode={projectMode} variant='nav' />
        </StyledIconLabel>
    );
};

const IconBreadcrumb: FC<{
    label: string;
    to: string;
    icon: BreadcrumbIcon;
}> = ({ label, to, icon: Icon }) => (
    <Tooltip title={label} arrow>
        <StyledIconLink to={to}>
            <Icon fontSize='small' />
        </StyledIconLink>
    </Tooltip>
);

const BreadcrumbItem: FC<{ view: BreadcrumbView }> = ({ view }) => {
    switch (view.kind) {
        case 'iconLink':
            return <IconBreadcrumb {...view} />;
        case 'link':
            return (
                <StyledLink to={view.to}>
                    <BreadcrumbLabel {...view} />
                </StyledLink>
            );
        case 'current':
            return (
                <StyledText aria-current='page'>
                    <BreadcrumbLabel {...view} />
                </StyledText>
            );
        case 'plain':
            return (
                <StyledText>
                    <BreadcrumbLabel {...view} />
                </StyledText>
            );
    }
};

const BreadcrumbTrail: FC<{ entityPage?: EntityPage }> = ({ entityPage }) => {
    const { pathname } = useLocation();
    const breadcrumbs = usePageBreadcrumbs(entityPage);

    if (breadcrumbs.length === 0) {
        return null;
    }

    const isLastInTrail = (index: number) => index === breadcrumbs.length - 1;

    return (
        <StyledBreadcrumbs aria-label='Breadcrumbs' separator='/'>
            {breadcrumbs.map((breadcrumb, index) => (
                <BreadcrumbItem
                    key={`${index}-${breadcrumb.label}`}
                    view={toBreadcrumbView(
                        breadcrumb,
                        isLastInTrail(index),
                        pathname,
                    )}
                />
            ))}
        </StyledBreadcrumbs>
    );
};

export const PageBreadcrumbs: FC = () => {
    const { pathname } = useLocation();
    const entityPage = findEntityPage(pathname);

    // Keyed by the entity page, because each one names its entity with its
    // own hook.
    return (
        <BreadcrumbTrail key={entityPage?.pattern} entityPage={entityPage} />
    );
};
