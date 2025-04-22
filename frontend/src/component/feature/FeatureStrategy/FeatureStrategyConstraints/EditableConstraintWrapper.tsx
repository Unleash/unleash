import { useCallback, useEffect, useState } from 'react';
import type { IConstraint } from 'interfaces/strategy';
import { cleanConstraint } from 'utils/cleanConstraint';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IUnleashContextDefinition } from 'interfaces/context';
import type { Operator } from 'constants/operators';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint';
import { useConstraintInput } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onCancel: () => void;
    onSave: (constraint: IConstraint) => void;
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

export const EditableConstraintWrapper = ({
    constraint,
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
    const [action, setAction] = useState('');

    const { input, validator, setError, error } = useConstraintInput({
        contextDefinition,
        localConstraint,
    });

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

    return (
        <EditableConstraint
            localConstraint={localConstraint}
            setLocalConstraint={setLocalConstraint}
            setContextName={setContextName}
            setOperator={setOperator}
            action={action}
            toggleInvertedOperator={setInvertedOperator}
            toggleCaseSensitivity={setCaseInsensitive}
            onDelete={onDelete}
            onUndo={onUndo}
            constraintChanges={constraintChanges}
            setValues={setValues}
            setValuesWithRecord={setValuesWithRecord}
            setValue={setValue}
            setError={setError}
            constraintValues={constraint?.values || []}
            constraintValue={constraint?.value || ''}
            input={input}
            error={error}
            contextDefinition={contextDefinition}
            removeValue={removeValue}
        />
    );
};
