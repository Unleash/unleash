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

    '[data-variant=nested] > &': {
        fontSize: theme.typography.body2.fontSize, // match other input labels
    },
}));

const StyledDescription = styled('p')(({ theme }) => ({
    margin: theme.spacing(0, 0, 1.5),
    color: theme.palette.text.primary,
}));

const StyledContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
    '&& > * + *': {
        marginTop: theme.spacing(2),
    },
    '&& > *:last-child': {
        marginBottom: 0,
    },

    '[data-variant=nested] > &': {
        padding: 0,
        border: 'none',
        borderRadius: 0,
        backgroundColor: 'inherit',
    },
}));

interface FormGroupProps extends Omit<ComponentProps<'fieldset'>, 'title'> {
    title?: ReactNode;
    description?: ReactNode;
    variant?: 'top-level' | 'nested';
}

export const FormGroup = ({
    title,
    description,
    children,
    variant,
    ...props
}: FormGroupProps) => (
    <StyledFieldset data-variant={variant} {...props}>
        {title ? <StyledLegend>{title}</StyledLegend> : null}
        {description ? (
            <StyledDescription>{description}</StyledDescription>
        ) : null}
        <StyledContent>{children}</StyledContent>
    </StyledFieldset>
);
