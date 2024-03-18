import {
    Autocomplete,
    IconButton,
    TextField,
    Tooltip,
    styled,
} from '@mui/material';
import type { ActionsFilterState } from '../../useProjectActionsForm';
import Delete from '@mui/icons-material/Delete';
import Input from 'component/common/Input/Input';
import { ProjectActionsFormItem } from '../ProjectActionsFormItem';
import { ConstraintOperatorSelect } from 'component/common/ConstraintAccordion/ConstraintOperatorSelect';
import {
    type Operator,
    allOperators,
    dateOperators,
    inOperators,
    stringOperators,
} from 'constants/operators';
import { useEffect, useState } from 'react';
import { oneOf } from 'utils/oneOf';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { CaseSensitiveButton } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/StyledToggleButton/CaseSensitiveButton/CaseSensitiveButton';
import { InvertedOperatorButton } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/StyledToggleButton/InvertedOperatorButton/InvertedOperatorButton';
import { ResolveInput } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/ResolveInput/ResolveInput';
import { useConstraintInput } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import { useUiFlag } from 'hooks/useUiFlag';

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

    const caseInsensitiveInOperators = useUiFlag('caseInsensitiveInOperators');

    const validOperators = allOperators.filter(
        (operator) => !oneOf(dateOperators, operator),
    );

    const { input, validator, setError, error } = useConstraintInput({
        contextDefinition: { legalValues: [] },
        localConstraint: { operator, value, values },
    });

    const validate = () => {
        stateChanged({
            ...filter,
            error: undefined,
        });
        const [typeValidatorResult, err] = validator();
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
        if (
            oneOf(stringOperators, operator) ||
            (oneOf(inOperators, operator) && caseInsensitiveInOperators)
        ) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }
    }, [operator, caseInsensitiveInOperators]);

    const onOperatorChange = (operator: Operator) => {
        if (
            oneOf(stringOperators, operator) ||
            (oneOf(inOperators, operator) && caseInsensitiveInOperators)
        ) {
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
                        setValuesWithRecord={setValues}
                        setValue={setValue}
                        setError={setError}
                        localConstraint={{ value, values }}
                        constraintValues={values || []}
                        constraintValue={value || ''}
                        input={input}
                        error={error}
                        contextDefinition={{ legalValues: [] }}
                        removeValue={removeValue}
                    />
                </StyledResolveInputWrapper>
            </StyledFilter>
        </ProjectActionsFormItem>
    );
};
