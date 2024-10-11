import { Box, List, styled } from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';

export const ContentGridContainer = styled('div')({
    containerType: 'inline-size',
});

const ContentGrid = styled('article')(({ theme }) => {
    return {
        backgroundColor: theme.palette.divider,
        borderRadius: `${theme.shape.borderRadiusLarge}px`,
        gap: `1px`,
        display: 'flex',
        flexFlow: 'column nowrap',

        '&>*': {
            backgroundColor: theme.palette.background.paper,
        },
    };
});

const onWideContainer =
    (css: object) =>
    ({ theme }: { theme: Theme }) => {
        const containerBreakpoint = '1000px';
        const screenBreakpoint = theme.breakpoints.up('lg');

        return {
            [`@container (min-width: ${containerBreakpoint})`]: css,

            '@supports not (container-type: inline-size)': {
                [screenBreakpoint]: css,
            },
        };
    };

export const ProjectGrid = styled(ContentGrid)(
    onWideContainer({
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '410px auto',
        display: 'grid',
        gridTemplateAreas: `
                "projects box1 box2"
                ". owners owners"
            `,
    }),
);

export const FlagGrid = styled(ContentGrid)(
    onWideContainer({
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '480px',
        display: 'grid',
        gridTemplateAreas: `
                "flags chart chart"
            `,
    }),
);

export const GridItem = styled('div', {
    shouldForwardProp: (prop) => !['gridArea', 'sx'].includes(prop.toString()),
})<{ gridArea: string }>(({ theme, gridArea }) => ({
    padding: theme.spacing(2, 4),
    maxHeight: '100%',
    overflowY: 'auto',
    gridArea,
}));

export const SpacedGridItem = styled('div', {
    shouldForwardProp: (prop) => prop !== 'gridArea',
})<{ gridArea: string }>(({ theme, gridArea }) => ({
    padding: theme.spacing(3, 4),
    maxHeight: '100%',
    overflowY: 'auto',
    gridArea,
}));

export const EmptyGridItem = styled('div', {
    shouldForwardProp: (prop) => prop !== 'gridArea',
})<{ gridArea?: string }>(({ theme, gridArea }) => ({
    display: 'none',
    gridArea,

    ...onWideContainer({
        display: 'block',
    })({ theme }),
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

export const StyledList = styled(List)(({ theme }) => ({
    overflowY: 'auto',
    maxHeight: '400px',

    ...onWideContainer({
        maxHeight: '100%',
    })({ theme }),
}));
