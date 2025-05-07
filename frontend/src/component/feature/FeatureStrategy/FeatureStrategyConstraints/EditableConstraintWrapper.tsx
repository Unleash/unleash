import { useCallback, useEffect, useState } from 'react';
import type { IConstraint } from 'interfaces/strategy';
import { cleanConstraint } from 'utils/cleanConstraint';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IUnleashContextDefinition } from 'interfaces/context';
import type { Operator } from 'constants/operators';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onCancel?: () => void;
    onDelete?: () => void;
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
    onDelete,
}: IConstraintAccordionEditProps) => {
    const [localConstraint, setLocalConstraint] = useState<IConstraint>(
        cleanConstraint(constraint),
    );

    const { context } = useUnleashContext();
    const [contextDefinition, setContextDefinition] = useState(
        resolveContextDefinition(context, localConstraint.contextName),
    );

    useEffect(() => {
        setContextDefinition(
            resolveContextDefinition(context, localConstraint.contextName),
        );
    }, [localConstraint.contextName, context]);

    const setContextName = useCallback((contextName: string) => {
        setLocalConstraint((prev) => {
            const localConstraint = cleanConstraint({
                ...prev,
                contextName,
                values: [],
                value: '',
            });

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

            return localConstraint;
        });
    }, []);

    const setInvertedOperator = () => {
        setLocalConstraint((prev) => {
            const localConstraint = { ...prev, inverted: !prev.inverted };

            return localConstraint;
        });
    };

    const setCaseInsensitive = useCallback(() => {
        setLocalConstraint((prev) => {
            const localConstraint = {
                ...prev,
                caseInsensitive: !prev.caseInsensitive,
            };

            return localConstraint;
        });
    }, []);

    const removeValue = useCallback(
        (index: number) => {
            const valueCopy = [...localConstraint.values!];
            valueCopy.splice(index, 1);
        },
        [localConstraint],
    );

    return (
        <EditableConstraint
            localConstraint={localConstraint}
            setLocalConstraint={setLocalConstraint}
            setContextName={setContextName}
            setOperator={setOperator}
            toggleInvertedOperator={setInvertedOperator}
            toggleCaseSensitivity={setCaseInsensitive}
            onDelete={onDelete}
            constraintChanges={constraintChanges}
            setValues={setValues}
            setValuesWithRecord={setValuesWithRecord}
            setValue={setValue}
            constraintValues={constraint?.values || []}
            constraintValue={constraint?.value || ''}
            contextDefinition={contextDefinition}
            removeValue={removeValue}
            constraint={constraint}
        />
    );
};
