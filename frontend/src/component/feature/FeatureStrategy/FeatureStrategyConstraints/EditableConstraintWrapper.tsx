import type { IConstraint } from 'interfaces/strategy';
import type { IUnleashContextDefinition } from 'interfaces/context';
import { EditableConstraint } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/EditableConstraint';

interface IConstraintAccordionEditProps {
    constraint: IConstraint;
    onDelete: () => void;
    onAutoSave: (constraint: IConstraint) => void;
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

export const EditableConstraintWrapper = (
    props: IConstraintAccordionEditProps,
) => {
    return <EditableConstraint {...props} />;
};
