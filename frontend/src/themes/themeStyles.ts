import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material';
import { CSSProperties } from 'react';

export const focusable = (theme: Theme) => ({
    '&:focus-visible': {
        outline: 0,
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 2,
        outlineColor: theme.palette.primary.main,
        borderRadius: '2px',
    },
});

export const contentSpacingY = (theme: Theme) => ({
    '& > *': {
        marginTop: `${theme.spacing(1)} !important`,
        marginBottom: `${theme.spacing(1)} !important`,
    },
});

export const title = (theme: Theme) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
});

export const textCenter = {
    textAlign: 'center',
} as const;

export const textTruncated = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
} as const;

export const flexRow = {
    display: 'flex',
    alignItems: 'center',
} as const;

export const flexColumn = {
    display: 'flex',
    flexDirection: 'column',
} as const;

export const itemsCenter = {
    alignItems: 'center',
} as const;

export const relative = {
    position: 'relative',
} as const;

export const formTemplateSidebarWidth = '27.5rem';
export const defaultBorderRadius = (theme: Theme) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
});

export const fadeInBottomStart = () => ({
    opacity: '0',
    position: 'fixed',
    right: '40px',
    bottom: '40px',
    transform: 'translateY(400px)',
});
export const fadeInBottomStartWithoutFixed: CSSProperties = {
    opacity: '0',
    right: '40px',
    bottom: '40px',
    transform: 'translateY(400px)',
    zIndex: 1400,
    position: 'fixed',
};
export const fadeInBottomEnter: CSSProperties = {
    transform: 'translateY(0)',
    opacity: '1',
    transition: 'transform 0.6s ease, opacity 1s ease',
};
export const fadeInBottomLeave: CSSProperties = {
    transform: 'translateY(400px)',
    opacity: '0',
    transition: 'transform 1.25s ease, opacity 1s ease',
};
export const fadeInTopStart = (theme: Theme): CSSProperties => ({
    opacity: '0',
    position: 'fixed',
    transform: 'translateY(-400px)',
});
export const fadeInTopEnter: CSSProperties = {
    transform: 'translateY(100px)',
    opacity: '1',
    transition: 'transform 0.6s ease, opacity 1s ease',
};
export const fadeInTopLeave: CSSProperties = {
    transform: 'translateY(-400px)',
    opacity: '0',
    transition: 'transform 1.25s ease, opacity 1s ease',
};

/**
 * Please extract styles below into MUI fragments as shown above
 * @deprecated
 */
export const useThemeStyles = makeStyles()(theme => ({
    focusable: {
        '&:focus-visible': {
            outline: 0,
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineOffset: 2,
            outlineColor: theme.palette.primary.main,
        },
    },
    contentSpacingY: {
        '& > *': {
            marginTop: '0.5rem !important',
            marginBottom: '0.5rem !important',
        },
    },
    divider: {
        margin: '1rem 0',
        backgroundColor: theme.palette.divider,
        height: '3px',
        width: '100%',
    },
    largeDivider: {
        margin: '2rem 0',
        backgroundColor: theme.palette.divider,
        height: '3px',
        width: '100%',
    },
    bold: {
        fontWeight: 'bold',
    },
    flexRow: {
        display: 'flex',
        alignItems: 'center',
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
    },
    itemsCenter: {
        alignItems: 'center',
    },
    justifyCenter: {
        justifyContent: 'center',
    },
    flexWrap: {
        flexWrap: 'wrap',
    },
    textCenter: {
        textAlign: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    fullHeight: {
        height: '100%',
    },
    title: {
        fontSize: theme.fontSizes.mainHeader,
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    error: {
        fontSize: theme.fontSizes.smallBody,
        color: theme.palette.error.main,
    },
}));
