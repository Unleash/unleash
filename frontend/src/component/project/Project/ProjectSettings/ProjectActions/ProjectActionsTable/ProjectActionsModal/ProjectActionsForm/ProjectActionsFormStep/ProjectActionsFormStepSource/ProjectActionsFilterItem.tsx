import {
    Autocomplete,
    IconButton,
    TextField,
    Tooltip,
    styled,
} from '@mui/material';
import type { ActionsFilterState } from '../../useProjectActionsForm.ts';
import Delete from '@mui/icons-material/Delete';
import Input from 'component/common/Input/Input';
import { ProjectActionsFormItem } from '../ProjectActionsFormItem.tsx';
import { ConstraintOperatorSelect } from 'component/common/NewConstraintAccordion/ConstraintOperatorSelect';
import {
    inOperators,
    isInOperator,
    isNumOperator,
    isSemVerOperator,
    isStringOperator,
    numOperators,
    type Operator,
    semVerOperators,
    stringOperators,
} from 'constants/operators';
import { useEffect, useState } from 'react';
import { oneOf } from 'utils/oneOf';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { CaseSensitiveButton } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/StyledToggleButton/CaseSensitiveButton/CaseSensitiveButton';
import { InvertedOperatorButton } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/StyledToggleButton/InvertedOperatorButton/InvertedOperatorButton';
import type { IConstraint } from 'interfaces/strategy.ts';
import { FreeTextInput } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/FreeTextInput/FreeTextInput.tsx';
import { SingleValue } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/SingleValue/SingleValue.tsx';
import { constraintValidator } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint/useEditableConstraint/constraint-validator.ts';

const StyledDeleteButton = styled(IconButton)({
    marginRight: '-6px',
});

const StyledFilter = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
});

const StyledFilterHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'start',
        gap: theme.spacing(2),
    },
}));

const StyledOperatorOptions = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'inline-flex',
    flex: 1,
    gap: theme.spacing(1),
}));

const StyledOperatorSelectWrapper = styled('div')(({ theme }) => ({
    width: '100%',
    '&&& > div': {
        width: '100%',
    },
}));

const StyledOperatorButtonWrapper = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    flex: 1,
    '&&& button': {
        marginRight: 0,
        '&:not(.operator-is-active)': {
            backgroundColor: theme.palette.background.elevation2,
        },
    },
}));

const StyledInputContainer = styled('div')({
    width: '100%',
    flex: 1,
});

const StyledInput = styled(Input)({
    width: '100%',
});

const StyledResolveInputWrapper = styled('div')(({ theme }) => ({
    '& > h3': {
        margin: theme.spacing(1, 0, 0, 0),
        fontSize: theme.fontSizes.smallBody,
    },
    '& > div': {
        margin: 0,
        maxWidth: 'unset',
        '& > div': {
            flex: 1,
        },
        '& .MuiFormControl-root': {
            margin: theme.spacing(0.5, 0, 0, 0),
        },
        '&:not(:first-of-type)': {
            marginTop: theme.spacing(1),
        },
    },
}));

interface IProjectActionsFilterItemProps {
    filter: ActionsFilterState;
    index: number;
    stateChanged: (updatedFilter: ActionsFilterState) => void;
    suggestions: string[];
    onDelete: () => void;
}

export const ProjectActionsFilterItem = ({
    filter,
    index,
    stateChanged,
    suggestions,
    onDelete,
}: IProjectActionsFilterItemProps) => {
    const { parameter, inverted, operator, caseInsensitive, value, values } =
        filter;

    const header = (
        <>
            <span>Filter {index + 1}</span>
            <div>
                <Tooltip title='Delete filter' arrow>
                    <StyledDeleteButton onClick={onDelete}>
                        <Delete />
                    </StyledDeleteButton>
                </Tooltip>
            </div>
        </>
    );

    // Adapted from `/frontend/src/component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditHeader/ConstraintAccordionEditHeader.tsx`
    const [showCaseSensitiveButton, setShowCaseSensitiveButton] =
        useState(false);

    const validOperators = [
        ...inOperators,
        ...stringOperators,
        ...numOperators,
        ...semVerOperators,
    ];

    const [error, setError] = useState('');
    const validator = constraintValidator(operator);

    const validate = () => {
        stateChanged({
            ...filter,
            error: undefined,
        });

        if (value === undefined && values === undefined) {
            return;
        }
        const validatorArgs = values ? values : [value || ''];
        const [typeValidatorResult, err] = validator(...validatorArgs);
        if (!typeValidatorResult) {
            setError(err);
            stateChanged({
                ...filter,
                error: err,
            });
        }
    };

    useEffect(() => {
        validate();
    }, [value, error]);

    useEffect(() => {
        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }
    }, [operator]);

    const onOperatorChange = (operator: Operator) => {
        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }

        stateChanged({
            ...filter,
            operator,
        });
    };

    const setValue = (value: string) => {
        stateChanged({
            ...filter,
            values: undefined,
            value,
        });
    };

    const setValues = (values: string[]) => {
        stateChanged({
            ...filter,
            value: undefined,
            values,
        });
    };

    const removeValue = (index: number) => {
        const newValues = values?.filter((_, i) => i !== index) || [];
        setValues(newValues);
    };

    return (
        <ProjectActionsFormItem index={index} header={header}>
            <StyledFilter>
                <StyledFilterHeader>
                    <StyledInputContainer>
                        <Autocomplete
                            freeSolo
                            options={suggestions}
                            value={parameter}
                            onInputChange={(_, parameter) =>
                                stateChanged({
                                    ...filter,
                                    parameter,
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size='small'
                                    label='Parameter'
                                />
                            )}
                        />
                    </StyledInputContainer>
                    <StyledOperatorOptions>
                        <StyledOperatorButtonWrapper>
                            <InvertedOperatorButton
                                localConstraint={{ inverted }}
                                setInvertedOperator={() =>
                                    stateChanged({
                                        ...filter,
                                        inverted: !inverted || undefined,
                                    })
                                }
                            />
                        </StyledOperatorButtonWrapper>
                        <StyledOperatorSelectWrapper>
                            <ConstraintOperatorSelect
                                options={validOperators}
                                value={operator}
                                onChange={onOperatorChange}
                            />
                        </StyledOperatorSelectWrapper>
                        <ConditionallyRender
                            condition={showCaseSensitiveButton}
                            show={
                                <StyledOperatorButtonWrapper>
                                    <CaseSensitiveButton
                                        localConstraint={{ caseInsensitive }}
                                        setCaseInsensitive={() =>
                                            stateChanged({
                                                ...filter,
                                                caseInsensitive:
                                                    !caseInsensitive ||
                                                    undefined,
                                            })
                                        }
                                    />
                                </StyledOperatorButtonWrapper>
                            }
                        />
                    </StyledOperatorOptions>
                </StyledFilterHeader>
                <StyledResolveInputWrapper>
                    <ResolveInput
                        setValues={setValues}
                        setValue={setValue}
                        setError={setError}
                        localConstraint={{ value, values }}
                        operator={operator}
                        error={error}
                        removeValue={removeValue}
                    />
                </StyledResolveInputWrapper>
            </StyledFilter>
        </ProjectActionsFormItem>
    );
};

interface IResolveInputProps {
    localConstraint: Pick<IConstraint, 'value' | 'values'>;
    setValue: (value: string) => void;
    setValues: (values: string[]) => void;
    setError: React.Dispatch<React.SetStateAction<string>>;
    removeValue: (index: number) => void;
    operator: Operator;
    error: string;
}

const ResolveInput = ({
    operator,
    localConstraint,
    setValue,
    setValues,
    setError,
    removeValue,
    error,
}: IResolveInputProps) => {
    if (isInOperator(operator)) {
        return (
            <FreeTextInput
                values={localConstraint.values || []}
                removeValue={removeValue}
                setValues={setValues}
                error={error}
                setError={setError}
            />
        );
    }

    if (isStringOperator(operator)) {
        return (
            <FreeTextInput
                values={localConstraint.values || []}
                removeValue={removeValue}
                setValues={setValues}
                error={error}
                setError={setError}
            />
        );
    }

    if (isNumOperator(operator)) {
        return (
            <SingleValue
                setValue={setValue}
                value={localConstraint.value}
                type='number'
                error={error}
                setError={setError}
            />
        );
    }

    if (isSemVerOperator(operator)) {
        return (
            <SingleValue
                setValue={setValue}
                value={localConstraint.value}
                type='semver'
                error={error}
                setError={setError}
            />
        );
    }
};
