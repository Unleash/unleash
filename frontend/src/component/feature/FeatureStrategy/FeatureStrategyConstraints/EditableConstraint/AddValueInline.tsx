import type { FC, ReactNode } from 'react';
import { Link, styled, type InputBaseComponentProps } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
    type InlineValueProps,
    type SubmitValue,
    LegalValuesInput,
    PlainValueInput,
} from './InlineValueInput.tsx';
import { RegexValueInput } from './AddRegexValueEditor/RegexValueInput.tsx';
import { MinimumVersionsTooltip } from './MinimumVersionsTooltip.tsx';
import { ConstraintDateInput } from './ConstraintDateInput.tsx';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';
import type { LegalValueData } from './useEditableConstraint/useEditableConstraint.js';
import {
    type EditableConstraint as EditableConstraintType,
    isCidrConstraint,
    isDateConstraint,
    isMultiValueConstraint,
    isNumberConstraint,
    isRegexConstraint,
    isSemVerConstraint,
} from './useEditableConstraint/editable-constraint-type.ts';
import { CidrTargetRange } from './CidrTargetRange.tsx';
import { parseParameterStrings } from 'utils/parseParameter';

const StyledHelpLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
}));

type EditingProps = {
    parseInput: (raw: string) => string[];
    helpText?: ReactNode;
    htmlInputProps?: InputBaseComponentProps;
    ValuePreview?: FC<{ value: string }>;
};

const singleValueParseInput = (raw: string) => [raw];

const cidrMinimumVersions: [sdk: string, version: string][] = [
    ['Node.js', '6.11.0'],
    ['Java', '12.3.0'],
    ['Ruby', '6.7.1'],
    ['Python', '6.7.0'],
    ['.NET', '6.2.0'],
    ['Go', '6.4.0'],
    ['Rust', '0.16.0'],
    [
        'Edge',
        'Frontend SDK connected to Unleash or Unleash Enterprise Edge: 20.2.0',
    ],
    ['PHP', 'Not supported'],
];

const regexMinimumVersions: [sdk: string, version: string][] = [
    ['Node.js', '6.10.0'],
    ['Java', '12.2.0'],
    ['Ruby', '6.5.0'],
    ['Python', '6.6.0'],
    ['.NET', '6.1.0'],
    ['Go', '6.2.0'],
    ['Rust', '0.16.0'],
    [
        'Edge',
        'Frontend SDK connected to Unleash or Unleash Enterprise Edge: 20.1.9',
    ],
    ['PHP', 'Not supported'],
];

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
            helpText: (
                <>
                    IP addresses or CIDR ranges, for example 192.168.1.1 or
                    10.0.0.0/8. IP constraints need a recent SDK.{' '}
                    <MinimumVersionsTooltip
                        minimumVersions={cidrMinimumVersions}
                    />
                </>
            ),
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
    if (isRegexConstraint(localConstraint)) {
        return {
            parseInput: singleValueParseInput,
            helpText: (
                <>
                    Use a valid{' '}
                    <StyledHelpLink
                        href='https://github.com/google/re2/wiki/Syntax'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        RE2 regular expression
                        <OpenInNew sx={{ fontSize: 'inherit' }} />
                    </StyledHelpLink>
                    . Regex needs a recent SDK.{' '}
                    <MinimumVersionsTooltip
                        minimumVersions={regexMinimumVersions}
                    />
                </>
            ),
        };
    }
    if (isDateConstraint(localConstraint)) {
        return {
            parseInput: singleValueParseInput,
            helpText: 'Pick a date and time, shown in your local time zone',
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

    const submitValue: SubmitValue = (
        rawValue,
        setError,
        setAnnouncement,
        checkValues,
    ) => {
        if (!rawValue?.trim()) {
            setError('Value cannot be empty or whitespace');
            return false;
        }

        const newValues = parseInput(rawValue);

        if (newValues.length === 0) {
            setError('Values cannot be empty');
            return false;
        }

        if (newValues.some((v) => v.length > 100)) {
            setError('Values cannot be longer than 100 characters');
            return false;
        }

        const checkError = checkValues?.(newValues);
        if (checkError) {
            setError(checkError);
            return false;
        }

        const [isValid, errorMessage] = validator(...newValues);
        if (!isValid) {
            setError(errorMessage);
            return false;
        }

        onAddValues(newValues);
        onChange('');
        setAnnouncement(`"${rawValue}" added`);
        setError('');
        return true;
    };

    const inlineValueProps: InlineValueProps = {
        value,
        onChange,
        htmlInputProps,
        submitValue,
        helpText,
        onClose,
        ValuePreview,
        multiValue,
        selectedValues,
        toggleValue,
        legalValues: legalValueData,
    };

    if (legalValueData) {
        return (
            <LegalValuesInput
                {...inlineValueProps}
                legalValues={legalValueData}
            />
        );
    }

    if (isRegexConstraint(localConstraint)) {
        return (
            <RegexValueInput
                value={value}
                onChange={onChange}
                onClose={onClose}
                submitValue={submitValue}
                helpText={helpText}
                caseInsensitive={Boolean(localConstraint.caseInsensitive)}
            />
        );
    }

    if (isDateConstraint(localConstraint)) {
        return (
            <ConstraintDateInput
                value={value}
                onChange={onChange}
                onClose={onClose}
                submitValue={submitValue}
                helpText={helpText}
            />
        );
    }

    return <PlainValueInput {...inlineValueProps} />;
};
