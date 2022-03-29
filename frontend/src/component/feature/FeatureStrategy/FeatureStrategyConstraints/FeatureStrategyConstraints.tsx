import { IConstraint, IFeatureStrategy } from 'interfaces/strategy';
import Constraint from 'component/common/Constraint/Constraint';
import Dialogue from 'component/common/Dialogue/Dialogue';
import React, { useState } from 'react';
import StrategyConstraints from 'component/feature/StrategyConstraints/StrategyConstraints';
import { List, ListItem } from '@material-ui/core';
import produce from 'immer';
import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

interface IFeatureStrategyConstraintsProps {
    projectId: string;
    environmentId: string;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
}

export const FeatureStrategyConstraints = ({
    projectId,
    environmentId,
    strategy,
    setStrategy,
}: IFeatureStrategyConstraintsProps) => {
    const [showConstraintsDialog, setShowConstraintsDialog] = useState(false);

    const [constraintErrors, setConstraintErrors] = useState<
        Record<string, string>
    >({});

    const updateConstraints = (constraints: IConstraint[]) => {
        setStrategy(prev => ({ ...prev, constraints }));
    };

    const removeConstraint = (index: number) => {
        setStrategy(
            produce(draft => {
                draft.constraints?.splice(index, 1);
            })
        );
    };

    const onConstraintsDialogSave = () => {
        const errors = findConstraintErrors(strategy.constraints);
        if (Object.keys(errors).length > 0) {
            setConstraintErrors(errors);
        } else {
            setShowConstraintsDialog(false);
        }
    };

    const onConstraintsDialogClose = () => {
        setStrategy(
            produce(draft => {
                draft.constraints = removeEmptyConstraints(draft.constraints);
            })
        );
        setShowConstraintsDialog(false);
    };

    return (
        <div>
            <List disablePadding dense>
                {strategy.constraints?.map((constraint, index) => (
                    <ListItem key={index} disableGutters dense>
                        <Constraint
                            constraint={constraint}
                            editCallback={() => setShowConstraintsDialog(true)}
                            deleteCallback={removeConstraint.bind(null, index)}
                        />
                    </ListItem>
                ))}
            </List>
            <Dialogue
                title="Define constraints"
                open={showConstraintsDialog}
                onClick={onConstraintsDialogSave}
                primaryButtonText="Update constraints"
                secondaryButtonText="Cancel"
                onClose={onConstraintsDialogClose}
                fullWidth
                maxWidth="md"
            >
                <StrategyConstraints
                    updateConstraints={updateConstraints}
                    constraints={strategy.constraints ?? []}
                    constraintError={constraintErrors}
                    setConstraintError={setConstraintErrors}
                />
            </Dialogue>
            <PermissionButton
                onClick={() => setShowConstraintsDialog(true)}
                variant="text"
                permission={[UPDATE_FEATURE_STRATEGY, CREATE_FEATURE_STRATEGY]}
                environmentId={environmentId}
                projectId={projectId}
            >
                Add constraints
            </PermissionButton>
        </div>
    );
};

const findConstraintErrors = (
    constraints: IConstraint[] = []
): Record<string, string> => {
    const entries = constraints
        .filter(isEmptyConstraint)
        .map((constraint, index) => `${constraint.contextName}-${index}`)
        .map(id => [id, 'You need to specify at least one value']);

    return Object.fromEntries(entries);
};

const removeEmptyConstraints = (
    constraints: IConstraint[] = []
): IConstraint[] => {
    return constraints.filter(constraint => !isEmptyConstraint(constraint));
};

const isEmptyConstraint = (constraint: IConstraint): boolean => {
    return !constraint.values || constraint.values.length === 0;
};
