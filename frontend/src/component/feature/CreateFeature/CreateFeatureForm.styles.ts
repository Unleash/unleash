import type { ElementType } from 'react';
import {
    FormControl,
    FormLabel,
    styled,
    ToggleButton,
    toggleButtonClasses,
    ToggleButtonGroup,
    toggleButtonGroupClasses,
} from '@mui/material';
import { controlHeights } from 'themes/controls';

export const Section = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 4),
}));

export const FieldGroup = styled(FormControl)<{ component: ElementType }>(
    ({ theme }) => ({
        padding: theme.spacing(0, 4),
    }),
);

export const Legend = styled(FormLabel)<{ component: ElementType }>(
    ({ theme }) => ({
        padding: 0,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing(1),
        '&.Mui-focused': {
            color: theme.palette.text.secondary,
        },
    }),
);

export const ChoiceGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}, & .${toggleButtonGroupClasses.lastButton}`]:
        {
            marginLeft: 0,
            borderRadius: `${theme.shape.borderRadius}px`,
            borderLeft: `1px solid ${theme.palette.divider}`,
        },
    [`& .${toggleButtonGroupClasses.grouped}.${toggleButtonClasses.selected}`]:
        {
            borderLeftColor: theme.palette.primary.main,
        },
}));

export const ChoiceChip = styled(ToggleButton)(({ theme }) => ({
    position: 'relative',
    height: controlHeights.medium,
    padding: theme.spacing(0, 1.5),
    gap: theme.spacing(1),
    textTransform: 'none',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    [`&.${toggleButtonClasses.selected}, &.${toggleButtonClasses.selected}:hover`]:
        {
            color: theme.palette.primary.main,
            fontWeight: theme.typography.fontWeightBold,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.container,
        },
    '& svg': {
        fontSize: theme.spacing(2),
    },
}));
