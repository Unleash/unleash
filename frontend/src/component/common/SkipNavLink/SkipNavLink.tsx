import { SKIP_NAV_TARGET_ID } from 'component/common/SkipNavLink/SkipNavTarget';
import { styled } from '@mui/material';
import { focusable } from 'themes/themeStyles';

const StyledLink = styled('a')(({ theme }) => ({
    position: 'fixed',
    overflow: 'hidden',
    zIndex: 1000,
    top: theme.spacing(2.25),
    left: theme.spacing(2.25),
    padding: theme.spacing(1, 2),
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    background: theme.palette.background.alternative,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.fontSizes.smallBody,
    ...focusable(theme),

    [theme.breakpoints.down(960)]: {
        top: '0.8rem',
        left: '0.8rem',
    },

    '&:not(:focus):not(:active)': {
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        zIndex: -1,
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
    },
}));

export const SkipNavLink = () => (
    <StyledLink href={`#${SKIP_NAV_TARGET_ID}`}>
        Skip to content <span aria-hidden>&darr;</span>
    </StyledLink>
);
