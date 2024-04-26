import { styled } from '@mui/material';
import { Card, Box } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { flexRow } from 'themes/themeStyles';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';

export const StyledProjectCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    '&:hover': {
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: theme.palette.neutral.light,
    },
    borderRadius: theme.shape.borderRadiusMedium,
}));

export const StyledProjectCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 2, 2, 2),
}));

export const StyledDivHeader = styled('div')(({ theme }) => ({
    ...flexRow,
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledCardTitle = styled('h3')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.body1.fontSize,
    lineClamp: '2',
    WebkitLineClamp: 2,
    lineHeight: '1.2',
    display: '-webkit-box',
    boxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignItems: 'flex-start',
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
}));

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

export const StyledDivInfoContainer = styled('div')(() => ({
    textAlign: 'center',
}));

export const StyledParagraphInfo = styled('p')(({ theme }) => ({
    color: theme.palette.primary.dark,
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
}));

export const StyledProjectIcon = styled(ProjectIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

export const StyledIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(0.5, 0.5, 0.5, 0),
    marginRight: theme.spacing(2),
}));
