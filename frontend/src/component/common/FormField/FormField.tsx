import { Children, cloneElement, isValidElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { styled } from '@mui/material';

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

// Gap before the control; label + description stay flush together above it.
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
    /** Optional test id on the field container (e.g. for e2e click targets). */
    'data-testid'?: string;
}

/**
 * A form field with a static label above the control (replacing MUI's floating
 * label), an optional description, and the control itself. Wires `htmlFor`/`id`
 * and `aria-describedby` so the label and description are associated with the
 * control for accessibility.
 */
/**
 * The label's element id, derived from the control's `id`. A `<label htmlFor>`
 * names native inputs, but not the non-labelable element a MUI `Select` /
 * radio group / switch exposes (e.g. a `div[role=combobox]`); those controls
 * point their `aria-labelledby` at this id instead. Keep in sync with how
 * controls derive it (see `GeneralSelect`).
 */
export const formFieldLabelId = (controlId: string) => `${controlId}-label`;

export const FormField = ({
    label,
    description,
    children,
    'data-testid': dataTestId,
}: IFormFieldProps) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    const child = Children.only(children);
    const control = isValidElement(child)
        ? cloneElement(child as ReactElement<Record<string, unknown>>, {
              id,
              'aria-describedby':
                  [
                      descriptionId,
                      (child.props as Record<string, unknown>)[
                          'aria-describedby'
                      ],
                  ]
                      .filter(Boolean)
                      .join(' ') || undefined,
          })
        : child;

    return (
        <StyledFormField data-testid={dataTestId}>
            <StyledLabel id={formFieldLabelId(id)} htmlFor={id}>
                {label}
            </StyledLabel>
            {description ? (
                <StyledDescription id={descriptionId}>
                    {description}
                </StyledDescription>
            ) : null}
            <StyledControl>{control}</StyledControl>
        </StyledFormField>
    );
};
