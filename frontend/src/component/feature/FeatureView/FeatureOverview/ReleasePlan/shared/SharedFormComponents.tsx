import { styled, Select, MenuItem } from '@mui/material';

export type FormMode = 'create' | 'edit' | 'display';

interface StyledFormContainerProps {
    mode?: FormMode;
}

export const StyledFormContainer = styled('form')<StyledFormContainerProps>(
    ({ theme, mode }) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        backgroundColor: theme.palette.background.elevation1,
        padding:
            mode === 'display' ? theme.spacing(1, 1.5) : theme.spacing(1.5, 2),
        border:
            mode === 'display' ? 'none' : `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['padding'], {
            duration: theme.transitions.duration.short,
        }),
        width: '100%',
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
        position: 'relative',
    }),
);

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
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}));

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
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
