import type { FC } from 'react';
import { Breadcrumbs, styled, type Theme } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { Truncator } from 'component/common/Truncator/Truncator';
import { usePageBreadcrumbs } from './usePageBreadcrumbs.ts';

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

export const PageBreadcrumbs: FC = () => {
    const { pathname } = useLocation();
    const breadcrumbs = usePageBreadcrumbs();

    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <StyledBreadcrumbs aria-label='Breadcrumbs' separator='/'>
            {breadcrumbs.map(({ label, to }, index) => {
                const key = `${index}-${label}`;
                const isCurrentPage =
                    index === breadcrumbs.length - 1 && to === pathname;
                const content = (
                    <Truncator title={label} arrow>
                        {label}
                    </Truncator>
                );

                return to && !isCurrentPage ? (
                    <StyledLink key={key} to={to}>
                        {content}
                    </StyledLink>
                ) : (
                    <StyledText
                        key={key}
                        aria-current={isCurrentPage ? 'page' : undefined}
                    >
                        {content}
                    </StyledText>
                );
            })}
        </StyledBreadcrumbs>
    );
};
