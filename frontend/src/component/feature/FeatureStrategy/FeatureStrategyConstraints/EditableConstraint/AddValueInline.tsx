import { type FC, forwardRef, useState } from 'react';
import type { InputBaseComponentProps } from '@mui/material';
import { AddValueButton } from './AddValueButton.tsx';
import { InlineValueInput, type OnAddActions } from './InlineValueInput.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';

type Props = {
    onAddValues: (newValues: string[]) => void;
    hasValues: boolean;
    multiValue: boolean;
    helpText?: string;
    validator: (...values: string[]) => ConstraintValidatorOutput;
    parseInput: (raw: string) => string[];
    htmlInputProps?: InputBaseComponentProps;
    ValuePreview?: FC<{ value: string }>;
};

export const AddValueInline = forwardRef<HTMLDivElement, Props>(
    (
        {
            onAddValues,
            hasValues,
            multiValue,
            helpText,
            validator,
            parseInput,
            htmlInputProps,
            ValuePreview,
        },
        ref,
    ) => {
        const [open, setOpen] = useState(false);
        const [draftValue, setDraftValue] = useState('');

        const handleAdd = (
            inputValue: string,
            { setError, clearInput }: OnAddActions,
        ) => {
            const newValues = parseInput(inputValue);

            if (newValues.length === 0) {
                setError('Values cannot be empty');
                return;
            }

            if (newValues.some((v) => v.length > 100)) {
                setError('Values cannot be longer than 100 characters');
                return;
            }

            const [isValid, errorMessage] = validator(...newValues);
            if (isValid) {
                onAddValues(newValues);
                clearInput();
                setError('');
            } else {
                setError(errorMessage);
            }
        };

        return (
            <div ref={ref}>
                {open ? (
                    <InlineValueInput
                        value={draftValue}
                        onChange={setDraftValue}
                        htmlInputProps={htmlInputProps}
                        onAdd={handleAdd}
                        helpText={helpText}
                        onClose={() => setOpen(false)}
                        ValuePreview={ValuePreview}
                        multiValue={multiValue}
                    />
                ) : (
                    <AddValueButton
                        hasValues={hasValues}
                        onClick={() => setOpen(true)}
                    />
                )}
            </div>
        );
    },
);
