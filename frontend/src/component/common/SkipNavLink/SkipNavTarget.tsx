import { styled } from '@mui/material';

export const SKIP_NAV_TARGET_ID = 'skip-nav-target-id';

const SkipLinkTarget = styled('a')(({ theme }) => ({
    clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
    boxSizing: 'border-box',
    position: 'absolute',
    margin: 0,
    padding: 0,

    top: 0,
    left: 0,
    width: '100%',

    ':focus': {
        clipPath: 'none',
        zIndex: 999,
        height: '80px',
        lineHeight: '80px',
        fontSize: '1.2rem',
        textDecoration: 'none',
        textAlign: 'center',

        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,

        outline: 'none',
    },
}));

export const SkipNavTarget = () => {
    return (
        <SkipLinkTarget href={`#${SKIP_NAV_TARGET_ID}`} id={SKIP_NAV_TARGET_ID}>
            Start of main content
        </SkipLinkTarget>
    );
};
