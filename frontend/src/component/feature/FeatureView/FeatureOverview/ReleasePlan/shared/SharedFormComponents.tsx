import { styled, Select, MenuItem, TextField } from '@mui/material';

export const StyledFormContainer = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    width: '100%',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    position: 'relative',
}));

export const StyledTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

export const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

export const StyledButtonGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
    minWidth: 120,
    maxWidth: 120,
    '& .MuiSelect-select': {
        fontSize: theme.typography.body2.fontSize,
        padding: theme.spacing(0.5, 1),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}));

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
    width: 80,
    '& .MuiInputBase-input': {
        fontSize: theme.typography.body2.fontSize,
        padding: theme.spacing(0.5, 1),
    },
}));

export const createStyledIcon = (IconComponent: React.ComponentType<any>) =>
    styled(IconComponent)(({ theme }) => ({
        color: theme.palette.common.white,
        fontSize: 18,
        flexShrink: 0,
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50%',
        padding: theme.spacing(0.25),
    }));

export const StyledErrorMessage = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
    paddingLeft: theme.spacing(3.25),
}));

export const StyledInfoLine = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    paddingLeft: theme.spacing(3.25),
    fontStyle: 'italic',
}));
