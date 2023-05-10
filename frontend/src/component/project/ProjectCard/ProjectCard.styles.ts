import { styled } from '@mui/material';
import { Card, Box } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIcon.svg';
import { flexRow } from 'themes/themeStyles';

export const StyledProjectCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(1, 2, 2, 2),
    width: '220px',
    height: '204px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: theme.spacing(1),
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    '&:hover': {
        transition: 'background-color 0.2s ease-in-out',
        backgroundColor: theme.palette.neutral.light,
    },
}));

export const StyledDivHeader = styled('div')(() => ({
    ...flexRow,
    width: '100%',
}));

export const StyledH2Title = styled('h2')(({ theme }) => ({
    fontWeight: 'normal',
    fontSize: theme.fontSizes.bodySize,
    lineClamp: 2,
    display: '-webkit-box',
    boxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignItems: 'flex-start',
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

export const StyledProjectIcon = styled(ProjectIcon)(({ theme }) => ({
    margin: theme.spacing(2, 'auto'),
    width: '80px',
    display: 'block',
    fill: 'red',
}));

export const StyledDivInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.fontSizes.smallerBody,
}));

export const StyledDivInfoContainer = styled('div')(() => ({
    textAlign: 'center',
}));

export const StyledParagraphInfo = styled('p')(({ theme }) => ({
    color: theme.palette.primary.dark,
    fontWeight: 'bold',
}));
