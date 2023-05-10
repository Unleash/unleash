import { useCallback, useEffect, useState } from 'react';
import { IConstraint } from 'interfaces/strategy';
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
import { IUnleashContextDefinition } from 'interfaces/context';
import { useConstraintInput } from './ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import { Operator } from 'constants/operators';
import { ResolveInput } from './ConstraintAccordionEditBody/ResolveInput/ResolveInput';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onCancel: () => void;
    onSave: (constraint: IConstraint) => void;
    compact: boolean;
    onDelete?: () => void;
}

export const CANCEL = 'cancel';
export const SAVE = 'save';

const resolveContextDefinition = (
    context: IUnleashContextDefinition[],
    contextName: string
): IUnleashContextDefinition => {
    const definition = context.find(
        contextDef => contextDef.name === contextName
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
    onCancel,
    onSave,
    onDelete,
}: IConstraintAccordionEditProps) => {
    const [localConstraint, setLocalConstraint] = useState<IConstraint>(
        cleanConstraint(constraint)
    );

    const { context } = useUnleashContext();
    const [contextDefinition, setContextDefinition] = useState(
        resolveContextDefinition(context, localConstraint.contextName)
    );
    const { validateConstraint } = useFeatureApi();
    const [expanded, setExpanded] = useState(false);
    const [action, setAction] = useState('');

    useEffect(() => {
        // Setting expanded to true on mount will cause the accordion
        // animation to take effect and transition the expanded accordion in
        setExpanded(true);
    }, []);

    useEffect(() => {
        setContextDefinition(
            resolveContextDefinition(context, localConstraint.contextName)
        );
    }, [localConstraint.contextName, context]);

    const setContextName = useCallback((contextName: string) => {
        setLocalConstraint(prev => ({
            ...prev,
            contextName,
            values: [],
            value: '',
        }));
    }, []);

    const setOperator = useCallback((operator: Operator) => {
        setLocalConstraint(prev => ({
            ...prev,
            operator,
            values: [],
            value: '',
        }));
    }, []);

    const setValues = useCallback((values: string[]) => {
        setLocalConstraint(prev => ({
            ...prev,
            values,
        }));
    }, []);

    const setValue = useCallback((value: string) => {
        setLocalConstraint(prev => ({ ...prev, value }));
    }, []);

    const setInvertedOperator = () => {
        setLocalConstraint(prev => ({ ...prev, inverted: !prev.inverted }));
    };

    const setCaseInsensitive = useCallback(() => {
        setLocalConstraint(prev => ({
            ...prev,
            caseInsensitive: !prev.caseInsensitive,
        }));
    }, []);

    const removeValue = useCallback(
        (index: number) => {
            const valueCopy = [...localConstraint.values!];
            valueCopy.splice(index, 1);

            setValues(valueCopy);
        },
        [localConstraint, setValues]
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

    const { input, validator, setError, error } = useConstraintInput({
        contextDefinition,
        localConstraint,
    });

    useEffect(() => {
        setError('');
        setLocalConstraint(localConstraint => cleanConstraint(localConstraint));
    }, [localConstraint.operator, localConstraint.contextName, setError]);

    return (
        <StyledForm>
            <StyledAccordion
                expanded={expanded}
                TransitionProps={{
                    onExited: () => {
                        if (action === CANCEL) {
                            setAction('');
                            onCancel();
                        } else if (action === SAVE) {
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
                            setValue={setValue}
                            setError={setError}
                            localConstraint={localConstraint}
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
