import { Children, cloneElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { styled } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledFormField = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const StyledLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledControl = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

interface IFormFieldProps {
    /** The field's property name — bold, shown above the control. */
    label: ReactNode;
    /** Optional helper/description text shown under the label, above the control. */
    description?: ReactNode;
    /** The control. Its `label` prop (floating label) should be omitted. */
    children: ReactElement;
}

export const FormField = ({
    label,
    description,
    children,
}: IFormFieldProps) => {
    const topLabelInputs = useUiFlag('topLabelInputs');
    const generatedId = useId();

    const child = Children.only(children) as ReactElement<
        Record<string, unknown>
    >;

    if (!topLabelInputs) {
        return cloneElement(child, { label }); // old floating label control
    }

    const ownId = child.props.id as string | undefined;
    const id = ownId ?? generatedId;
    const descriptionId = description ? `${id}-description` : undefined;
    const describedByIds = [
        descriptionId,
        child.props['aria-describedby'],
    ].filter(Boolean);
    const describedBy = describedByIds.join(' ') || undefined;

    const control = cloneElement(child, {
        id,
        'aria-describedby': describedBy,
    });

    return (
        <StyledFormField>
            <StyledLabel htmlFor={id}>{label}</StyledLabel>
            {description ? (
                <StyledDescription id={descriptionId}>
                    {description}
                </StyledDescription>
            ) : null}
            <StyledControl>{control}</StyledControl>
        </StyledFormField>
    );
};
