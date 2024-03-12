import { useCallback, useEffect, useState } from 'react';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionEditBody } from './ConstraintAccordionEditBody/ConstraintAccordionEditBody';
import { ConstraintAccordionEditHeader } from './ConstraintAccordionEditHeader/ConstraintAccordionEditHeader';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import { cleanConstraint } from 'utils/cleanConstraint';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { IUnleashContextDefinition } from 'interfaces/context';
import { useConstraintInput } from './ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import type { Operator } from 'constants/operators';
import { ResolveInput } from './ConstraintAccordionEditBody/ResolveInput/ResolveInput';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onCancel: () => void;
    onSave: (constraint: IConstraint) => void;
    compact: boolean;
    onDelete?: () => void;
    onAutoSave?: (constraint: IConstraint) => void;
}

export const CANCEL = 'cancel';
export const SAVE = 'save';

const resolveContextDefinition = (
    context: IUnleashContextDefinition[],
    contextName: string,
): IUnleashContextDefinition => {
    const definition = context.find(
        (contextDef) => contextDef.name === contextName,
    );

    return (
        definition || {
            name: '',
            description: '',
            createdAt: '',
            sortOrder: 1,
            stickiness: false,
        }
    );
};

const StyledForm = styled('div')({ padding: 0, margin: 0, width: '100%' });

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
    boxShadow: 'none',
    margin: 0,
    '& .expanded': {
        '&:before': {
            opacity: '0 !important',
        },
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    border: 'none',
    padding: theme.spacing(0.5, 3),
    '&:hover .valuesExpandLabel': {
        textDecoration: 'underline',
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderTop: `1px dashed ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
}));

export const ConstraintAccordionEdit = ({
    constraint,
    compact,
    onSave,
    onDelete,
    onAutoSave,
}: IConstraintAccordionEditProps) => {
    const [localConstraint, setLocalConstraint] = useState<IConstraint>(
        cleanConstraint(constraint),
    );
    const [constraintChanges, setConstraintChanges] = useState<IConstraint[]>([
        cleanConstraint(constraint),
    ]);

    const { context } = useUnleashContext();
    const [contextDefinition, setContextDefinition] = useState(
        resolveContextDefinition(context, localConstraint.contextName),
    );
    const { validateConstraint } = useFeatureApi();
    const [expanded, setExpanded] = useState(false);
    const [action, setAction] = useState('');

    const { input, validator, setError, error } = useConstraintInput({
        contextDefinition,
        localConstraint,
    });

    useEffect(() => {
        // Setting expanded to true on mount will cause the accordion
        // animation to take effect and transition the expanded accordion in
        setExpanded(true);
    }, []);

    useEffect(() => {
        setContextDefinition(
            resolveContextDefinition(context, localConstraint.contextName),
        );
    }, [localConstraint.contextName, context]);

    useEffect(() => {
        setError('');
    }, [setError]);

    const onUndo = () => {
        if (constraintChanges.length < 2) return;
        const previousChange = constraintChanges[constraintChanges.length - 2];

        setLocalConstraint(previousChange);
        setConstraintChanges((prev) => prev.slice(0, prev.length - 1));
        autoSave(previousChange);
    };

    const autoSave = (localConstraint: IConstraint) => {
        if (onAutoSave) {
            onAutoSave(localConstraint);
        }
    };

    const recordChange = (localConstraint: IConstraint) => {
        setConstraintChanges((prev) => [...prev, localConstraint]);
        autoSave(localConstraint);
    };

    const setContextName = useCallback((contextName: string) => {
        setLocalConstraint((prev) => {
            const localConstraint = cleanConstraint({
                ...prev,
                contextName,
                values: [],
                value: '',
            });

            recordChange(localConstraint);

            return localConstraint;
        });
    }, []);

    const setOperator = useCallback((operator: Operator) => {
        setLocalConstraint((prev) => {
            const localConstraint = cleanConstraint({
                ...prev,
                operator,
                values: [],
                value: '',
            });

            recordChange(localConstraint);

            return localConstraint;
        });
    }, []);

    const setValuesWithRecord = useCallback((values: string[]) => {
        setLocalConstraint((prev) => {
            const localConstraint = { ...prev, values };

            recordChange(localConstraint);

            return localConstraint;
        });
    }, []);

    const setValues = useCallback((values: string[]) => {
        setLocalConstraint((prev) => {
            const localConstraint = { ...prev, values };

            return localConstraint;
        });
    }, []);

    const setValue = useCallback((value: string) => {
        setLocalConstraint((prev) => {
            const localConstraint = { ...prev, value };

            recordChange(localConstraint);

            return localConstraint;
        });
    }, []);

    const setInvertedOperator = () => {
        setLocalConstraint((prev) => {
            const localConstraint = { ...prev, inverted: !prev.inverted };

            recordChange(localConstraint);

            return localConstraint;
        });
    };

    const setCaseInsensitive = useCallback(() => {
        setLocalConstraint((prev) => {
            const localConstraint = {
                ...prev,
                caseInsensitive: !prev.caseInsensitive,
            };

            recordChange(localConstraint);

            return localConstraint;
        });
    }, []);

    const removeValue = useCallback(
        (index: number) => {
            const valueCopy = [...localConstraint.values!];
            valueCopy.splice(index, 1);

            setValuesWithRecord(valueCopy);
        },
        [localConstraint, setValuesWithRecord],
    );

    const triggerTransition = () => {
        setExpanded(false);
    };

    const validateConstraintValues = () => {
        const hasValues =
            Array.isArray(localConstraint.values) &&
            Boolean(localConstraint.values.length > 0);
        const hasValue = Boolean(localConstraint.value);

        if (hasValues || hasValue) {
            setError('');
            return true;
        }
        setError('You must provide a value for the constraint');
        return false;
    };

    const onSubmit = async () => {
        const hasValues = validateConstraintValues();
        if (!hasValues) return;
        const [typeValidatorResult, err] = validator();

        if (!typeValidatorResult) {
            setError(err);
        }

        if (typeValidatorResult) {
            try {
                await validateConstraint(localConstraint);
                setError('');
                setAction(SAVE);
                triggerTransition();
                return;
            } catch (error: unknown) {
                setError(formatUnknownError(error));
            }
        }
    };

    return (
        <StyledForm>
            <StyledAccordion
                expanded={expanded}
                TransitionProps={{
                    onExited: () => {
                        if (action === SAVE) {
                            setAction('');
                            onSave(localConstraint);
                        }
                    },
                }}
            >
                <StyledAccordionSummary>
                    <ConstraintAccordionEditHeader
                        localConstraint={localConstraint}
                        setLocalConstraint={setLocalConstraint}
                        setContextName={setContextName}
                        setOperator={setOperator}
                        action={action}
                        compact={compact}
                        setInvertedOperator={setInvertedOperator}
                        setCaseInsensitive={setCaseInsensitive}
                        onDelete={onDelete}
                        onUndo={onUndo}
                        constraintChanges={constraintChanges}
                    />
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                    <ConstraintAccordionEditBody
                        localConstraint={localConstraint}
                        setValues={setValues}
                        setValue={setValue}
                        triggerTransition={triggerTransition}
                        setAction={setAction}
                        onSubmit={onSubmit}
                    >
                        <ResolveInput
                            setValues={setValues}
                            setValuesWithRecord={setValuesWithRecord}
                            setValue={setValue}
                            setError={setError}
                            localConstraint={localConstraint}
                            constraintValues={constraint?.values || []}
                            constraintValue={constraint?.value || ''}
                            input={input}
                            error={error}
                            contextDefinition={contextDefinition}
                            removeValue={removeValue}
                        />
                    </ConstraintAccordionEditBody>
                </StyledAccordionDetails>
            </StyledAccordion>
        </StyledForm>
    );
};
