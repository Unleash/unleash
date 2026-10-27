import type { FC } from 'react';
import type { InputBaseComponentProps } from '@mui/material';
import { InlineValueInput, type OnAddActions } from './InlineValueInput.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';
import {
    type EditableConstraint as EditableConstraintType,
    isCidrConstraint,
    isMultiValueConstraint,
    isNumberConstraint,
    isSemVerConstraint,
} from './useEditableConstraint/editable-constraint-type.ts';
import { CidrTargetRange } from './CidrTargetRange.tsx';
import { parseParameterStrings } from 'utils/parseParameter';

type EditingProps = {
    parseInput: (raw: string) => string[];
    helpText?: string;
    htmlInputProps?: InputBaseComponentProps;
    ValuePreview?: FC<{ value: string }>;
};

const singleValueParseInput = (raw: string) => [raw];

const getEditingProps = (
    localConstraint: EditableConstraintType,
): EditingProps => {
    if (isSemVerConstraint(localConstraint)) {
        return {
            parseInput: singleValueParseInput,
            helpText:
                'A semver value should be of the format X.Y.Z, optionally with a prerelease and/or build suffix, such as 1.2.3-beta.1+build.5',
        };
    }
    if (isCidrConstraint(localConstraint)) {
        return {
            parseInput: parseParameterStrings,
            helpText:
                'IP addresses or CIDR ranges, for example 192.168.1.1 or 10.0.0.0/8',
            ValuePreview: CidrTargetRange,
        };
    }
    if (isNumberConstraint(localConstraint)) {
        return {
            parseInput: singleValueParseInput,
            htmlInputProps: { inputMode: 'decimal' },
            helpText: 'Add a single number',
        };
    }
    return {
        parseInput: parseParameterStrings,
        helpText: 'Maximum 100 char length per value',
    };
};

type Props = {
    localConstraint: EditableConstraintType;
    value: string;
    onChange: (value: string) => void;
    onAddValues: (newValues: string[]) => void;
    onClose: () => void;
    validator: (...values: string[]) => ConstraintValidatorOutput;
};

export const AddValueInline: FC<Props> = ({
    localConstraint,
    value,
    onChange,
    onAddValues,
    onClose,
    validator,
}) => {
    const multiValue = isMultiValueConstraint(localConstraint);
    const { parseInput, helpText, htmlInputProps, ValuePreview } =
        getEditingProps(localConstraint);

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
        <InlineValueInput
            value={value}
            onChange={onChange}
            htmlInputProps={htmlInputProps}
            onAdd={handleAdd}
            helpText={helpText}
            onClose={onClose}
            ValuePreview={ValuePreview}
            multiValue={multiValue}
        />
    );
};
