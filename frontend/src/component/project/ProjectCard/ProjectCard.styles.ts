import { styled } from '@mui/material';
import { Card, Box } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { flexRow } from 'themes/themeStyles';

export const StyledProjectCard = styled(Card)<{ disabled?: boolean }>(
    ({ theme, disabled = false }) => ({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        [theme.breakpoints.down('sm')]: {
            justifyContent: 'center',
        },
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: disabled
            ? theme.palette.neutral.light
            : theme.palette.background.default,
        '&:hover': {
            backgroundColor: theme.palette.neutral.light,
        },
        borderRadius: theme.shape.borderRadiusMedium,
    }),
);

export const StyledProjectCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 2, 2, 2),
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
    height: '100%',
}));

export const StyledDivHeader = styled('div')(({ theme }) => ({
    ...flexRow,
    width: '100%',
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
}));

export const StyledCardTitle = styled('h3')<{ lines?: number }>(
    ({ theme, lines = 2 }) => ({
        fontWeight: theme.typography.fontWeightRegular,
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

export const StyledBox = styled(Box)(() => ({
    ...flexRow,
    marginRight: 'auto',
}));

export const StyledEditIcon = styled(Edit)(({ theme }) => ({
    color: theme.palette.neutral.main,
    marginRight: theme.spacing(1),
}));

export const StyledDeleteIcon = styled(Delete)(({ theme }) => ({
    color: theme.palette.neutral.main,
    marginRight: theme.spacing(1),
}));

export const StyledDivInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.fontSizes.smallerBody,
    padding: theme.spacing(0, 1),
}));

export const StyledParagraphInfo = styled('p')<{ disabled?: boolean }>(
    ({ theme, disabled = false }) => ({
        color: disabled ? 'inherit' : theme.palette.primary.dark,
        fontWeight: disabled ? 'normal' : 'bold',
        fontSize: theme.typography.body1.fontSize,
    }),
);

export const StyledIconBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
    padding: theme.spacing(0, 0.5, 0, 1),
    marginRight: theme.spacing(1),
    alignSelf: 'baseline',
    color: theme.palette.primary.main,
    height: '100%',
}));

export const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginRight: theme.spacing(2),
}));
