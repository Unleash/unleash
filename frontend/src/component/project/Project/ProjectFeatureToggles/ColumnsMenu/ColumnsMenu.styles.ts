import {
    Box,
    Checkbox,
    Divider,
    IconButton,
    MenuItem,
    styled,
} from '@mui/material';

import { flexRow } from 'themes/themeStyles';

export const StyledBoxContainer = styled(Box)(() => ({
    ...flexRow,
    justifyContent: 'center',
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
    margin: theme.spacing(-1, 0),
}));

export const StyledBoxMenuHeader = styled(Box)(({ theme }) => ({
    ...flexRow,
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1, 0, 4),
}));

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    padding: theme.spacing(0, 2),
    margin: theme.spacing(0, 2),
    borderRadius: theme.shape.borderRadius,
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
    '&.MuiDivider-root.MuiDivider-fullWidth': {
        margin: theme.spacing(0.75, 0),
    },
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
}));
