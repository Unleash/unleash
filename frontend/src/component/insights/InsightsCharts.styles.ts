import { Box, Paper, styled, Typography } from '@mui/material';

export const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

export const StyledCompactCard = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: theme.shadows[2],
        transform: 'translateY(-2px)',
    },
}));

export const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
        boxShadow: theme.shadows[2],
    },
}));

export const StyledWidgetContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    width: '100%',
}));

export const StyledWidgetStats = styled(Box)<{
    width?: number;
    padding?: number;
}>(({ theme, width = 300, padding = 2 }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(padding),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

export const StyledChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
    width: '100%',
    padding: theme.spacing(2),
    height: '300px',
    '& canvas': {
        maxHeight: '280px',
    },
}));

export const StatsExplanation = styled(Typography)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
}));
