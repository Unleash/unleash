import { Box, List, type Theme, styled } from '@mui/material';

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
        gridTemplateRows: '410px',
        display: 'grid',
        gridTemplateAreas: `
                "flags chart chart"
            `,
    }),
);

export const AccordionContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 4),
}));

export const GridItem = styled(AccordionContent, {
    shouldForwardProp: (prop) => !['gridArea'].includes(prop.toString()),
})<{ gridArea: string }>(({ theme, gridArea }) => ({
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
    maxHeight: '400px',

    ...onWideContainer({
        maxHeight: '100%',
    })({ theme }),
}));

export const StyledCardTitle = styled('div')<{ lines?: number }>(
    ({ theme, lines = 2 }) => ({
        fontWeight: theme.typography.fontWeightBold,
        fontSize: theme.typography.body1.fontSize,
        lineClamp: `${lines}`,
        WebkitLineClamp: lines,
        lineHeight: '1.2',
        display: '-webkit-box',
        boxOrient: 'vertical',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        alignItems: 'flex-start',
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
    }),
);

export const NeutralCircleContainer = styled('span')(({ theme }) => ({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutral.border,
    borderRadius: '50%',
}));
