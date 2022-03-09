import { useCallback, useEffect, useState } from 'react';
import { IConstraint } from '../../../../interfaces/strategy';
import { useStyles } from '../ConstraintAccordion.styles';
import { ConstraintAccordionEditBody } from './ConstraintAccordionEditBody/ConstraintAccordionEditBody';
import { ConstraintAccordionEditHeader } from './ConstraintAccordionEditHeader/ConstraintAccordionEditHeader';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from '@material-ui/core';
import { cleanConstraint } from 'utils/cleanConstraint';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { formatUnknownError } from 'utils/format-unknown-error';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from 'interfaces/params';
import { IUnleashContextDefinition } from 'interfaces/context';
import { useConstraintInput } from './ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import { Operator } from 'constants/operators';
import { ResolveInput } from './ConstraintAccordionEditBody/ResolveInput/ResolveInput';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onCancel: () => void;
    onSave: (constraint: IConstraint) => void;
    compact: boolean;
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

export const ConstraintAccordionEdit = ({
    constraint,
    compact,
    onCancel,
    onSave,
}: IConstraintAccordionEditProps) => {
    const [localConstraint, setLocalConstraint] = useState<IConstraint>(
        cleanConstraint(constraint)
    );

    const { context } = useUnleashContext();
    const [contextDefinition, setContextDefinition] = useState(
        resolveContextDefinition(context, localConstraint.contextName)
    );
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { validateConstraint } = useFeatureApi();
    const [expanded, setExpanded] = useState(false);
    const [action, setAction] = useState('');
    const styles = useStyles();

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
                await validateConstraint(projectId, featureId, localConstraint);

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
        <div className={styles.form}>
            <Accordion
                style={{ boxShadow: 'none' }}
                className={styles.accordion}
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
                <AccordionSummary className={styles.summary}>
                    <ConstraintAccordionEditHeader
                        localConstraint={localConstraint}
                        setLocalConstraint={setLocalConstraint}
                        setContextName={setContextName}
                        setOperator={setOperator}
                        action={action}
                        compact={compact}
                    />
                </AccordionSummary>

                <AccordionDetails
                    className={styles.accordionDetails}
                    style={{ padding: 0 }}
                >
                    <ConstraintAccordionEditBody
                        localConstraint={localConstraint}
                        setValues={setValues}
                        setValue={setValue}
                        setCaseInsensitive={setCaseInsensitive}
                        triggerTransition={triggerTransition}
                        setAction={setAction}
                        setInvertedOperator={setInvertedOperator}
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
                            setCaseInsensitive={setCaseInsensitive}
                        />
                    </ConstraintAccordionEditBody>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};
