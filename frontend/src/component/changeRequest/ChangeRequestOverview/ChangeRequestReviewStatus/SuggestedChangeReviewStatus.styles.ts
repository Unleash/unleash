import { styled } from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, Typography, Divider } from '@mui/material';

const styledComponentPropCheck = () => (prop: string) =>
    prop !== 'color' && prop !== 'sx' && prop !== 'approved';

export const StyledFlexAlignCenterBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));

export const StyledErrorIcon = styled(Cancel)(({ theme }) => ({
    color: theme.palette.error.main,
    height: '35px',
    width: '35px',
    marginRight: theme.spacing(1),
}));

export const StyledSuccessIcon = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.success.main,
    height: '35px',
    width: '35px',
    marginRight: theme.spacing(1),
}));

export const StyledOuterContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: theme.spacing(2),
}));

export const StyledButtonContainer = styled(Box, {
    shouldForwardProp: styledComponentPropCheck(),
})<{ approved: boolean }>(({ theme, approved }) => ({
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    backgroundColor: approved
        ? theme.palette.success.main
        : theme.palette.tableHeaderBackground,
    padding: theme.spacing(1, 2),
    marginRight: theme.spacing(2),
    height: '45px',
    width: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ['svg']: {
        color: approved
            ? theme.palette.tertiary.background
            : theme.palette.neutral.main,
    },
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
    margin: theme.spacing(2.5, 0),
}));

export const StyledReviewStatusContainer = styled(Box, {
    shouldForwardProp: styledComponentPropCheck(),
})<{ approved: boolean }>(({ theme, approved }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    border: approved
        ? `2px solid ${theme.palette.success.main}`
        : `1px solid ${theme.palette.tertiary.main}`,
    padding: theme.spacing(3),
    width: '100%',
}));

export const StyledReviewTitle = styled(Typography, {
    shouldForwardProp: styledComponentPropCheck(),
})<{ approved: boolean }>(({ theme, approved }) => ({
    fontWeight: 'bold',
    color: approved ? theme.palette.success.main : theme.palette.error.main,
}));
