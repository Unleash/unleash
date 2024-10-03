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

export const ProjectGrid = styled(ContentGrid2)(({ theme }) => ({
    '@container (min-width: 1000px)': {
        gridTemplateColumns: '1fr 1fr 1fr',
        display: 'grid',
        gridTemplateAreas: `
                "title onboarding onboarding"
                "projects box1 box2"
                ". owners owners"
            `,
    },

    '@supports not (container-type: inline-size)': {
        [theme.breakpoints.up('lg')]: {
            gridTemplateColumns: '1fr 1fr 1fr',
            display: 'grid',
            gridTemplateAreas: `
                "title onboarding onboarding"
                "projects box1 box2"
                ". owners owners"
            `,
        },
    },
}));

export const SpacedGridItem2 = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
}));

export const EmptyGridItem = styled('div')(({ theme }) => ({
    display: 'none',

    '@container (min-width: 1000px)': {
        display: 'block',
    },

    '@supports not (container-type: inline-size)': {
        [theme.breakpoints.up('lg')]: {
            display: 'block',
        },
    },
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
