import type { FC } from 'react';
import type { InputBaseComponentProps } from '@mui/material';
import {
    type InlineValueProps,
    LegalValuesInput,
    PlainValueInput,
} from './InlineValueInput.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';
import type { LegalValueData } from './useEditableConstraint/useEditableConstraint.js';
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

const withLegalValues = (
    editingProps: EditingProps,
    localConstraint: EditableConstraintType,
): EditingProps => ({
    ...editingProps,
    helpText: undefined,
    parseInput: isMultiValueConstraint(localConstraint)
        ? parseParameterStrings
        : singleValueParseInput,
});

const resolveEditingProps = (
    localConstraint: EditableConstraintType,
    legalValueData: LegalValueData | undefined,
): EditingProps => {
    const editingProps = getEditingProps(localConstraint);

    return legalValueData
        ? withLegalValues(editingProps, localConstraint)
        : editingProps;
};

type Props = {
    localConstraint: EditableConstraintType;
    value: string;
    onChange: (value: string) => void;
    onAddValues: (newValues: string[]) => void;
    onClose: (shouldManageFocus: boolean) => void;
    validator: (...values: string[]) => ConstraintValidatorOutput;
    selectedValues: Set<string>;
    toggleValue: (value: string) => void;
    legalValueData?: LegalValueData;
};

export const AddValueInline: FC<Props> = ({
    localConstraint,
    value,
    onChange,
    onAddValues,
    onClose,
    validator,
    selectedValues,
    toggleValue,
    legalValueData,
}) => {
    const multiValue = isMultiValueConstraint(localConstraint);
    const { parseInput, helpText, htmlInputProps, ValuePreview } =
        resolveEditingProps(localConstraint, legalValueData);

    const inlineValueProps: InlineValueProps = {
        value,
        onChange,
        htmlInputProps,
        parseInput,
        validator,
        onAddValues,
        helpText,
        onClose,
        ValuePreview,
        multiValue,
        selectedValues,
        toggleValue,
        legalValues: legalValueData,
    };

    return legalValueData ? (
        <LegalValuesInput {...inlineValueProps} legalValues={legalValueData} />
    ) : (
        <PlainValueInput {...inlineValueProps} />
    );
};
