import { styled } from '@mui/material';
import type { ComponentProps, ReactNode } from 'react';

const StyledFieldset = styled('fieldset')({
    minWidth: 0,
    margin: 0,
    padding: 0,
    border: 0,
});

const StyledLegend = styled('legend')(({ theme }) => ({
    padding: 0,
    marginBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
    '& > * + *': {
        marginTop: theme.spacing(2),
    },
    '& > *:last-child': {
        marginBottom: 0,
    },
}));

interface FormGroupProps extends Omit<ComponentProps<'fieldset'>, 'title'> {
    title?: ReactNode;
}

export const FormGroup = ({ title, children, ...props }: FormGroupProps) => (
    <StyledFieldset {...props}>
        {title ? <StyledLegend>{title}</StyledLegend> : null}
        <StyledContent>{children}</StyledContent>
    </StyledFieldset>
);
