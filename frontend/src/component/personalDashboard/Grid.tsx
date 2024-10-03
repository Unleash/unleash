import { Box, Grid, styled } from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';

export const ContentGridContainer = styled('div')({
    containerType: 'inline-size',
});

const ContentGrid2 = styled('article')(({ theme }) => {
    return {
        backgroundColor: theme.palette.divider,
        borderRadius: `${theme.shape.borderRadiusLarge}px`,
        overflow: 'hidden',
        border: `0.5px solid ${theme.palette.divider}`,
        gap: `2px`,
        display: 'flex',
        flexFlow: 'column nowrap',

        '&>*': {
            backgroundColor: theme.palette.background.paper,
        },
    };
});

const withContainerQueryFallback = (css: object) => (theme: Theme) => {
    const containerBreakpoint = '1000px';
    const screenBreakpoint = theme.breakpoints.up('lg');

    return {
        [`@container (min-width: ${containerBreakpoint})`]: css,

        '@supports not (container-type: inline-size)': {
            [screenBreakpoint]: css,
        },
    };
};

export const ProjectGrid = styled(ContentGrid2)(({ theme }) =>
    withContainerQueryFallback({
        gridTemplateColumns: '1fr 1fr 1fr',
        display: 'grid',
        gridTemplateAreas: `
                "title onboarding onboarding"
                "projects box1 box2"
                ". owners owners"
            `,
    })(theme),
);

export const FlagGrid = styled(ContentGrid2)(({ theme }) =>
    withContainerQueryFallback({
        gridTemplateColumns: '1fr 2fr',
        display: 'grid',
        gridTemplateAreas: `
                "title lifecycle"
                "flags chart"
            `,
    })(theme),
);

export const SpacedGridItem2 = styled('div', {
    shouldForwardProp: (prop) => prop !== 'gridArea',
})<{ gridArea: string }>(({ theme, gridArea }) => ({
    padding: theme.spacing(4),
    gridArea,
}));

export const EmptyGridItem = styled('div')(({ theme }) => ({
    display: 'none',

    ...withContainerQueryFallback({
        display: 'block',
    })(theme),
}));

export const ContentGrid = styled(Grid)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

export const SpacedGridItem = styled(Grid)(({ theme }) => ({
    padding: theme.spacing(4),
    border: `0.5px solid ${theme.palette.divider}`,
}));

export const ListItemBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    width: '100%',
}));

export const listItemStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
});
