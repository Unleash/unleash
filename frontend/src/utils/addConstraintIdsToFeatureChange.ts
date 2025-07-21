import type {
    IFeatureChange,
    IChangeRequestAddStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { constraintId } from 'constants/constraintId';
import { v4 as uuidv4 } from 'uuid';

const isAddStrategyChange = (
    change: IFeatureChange,
): change is IChangeRequestAddStrategy => change.action === 'addStrategy';
const isUpdateStrategyChange = (
    change: IFeatureChange,
): change is IChangeRequestUpdateStrategy => change.action === 'updateStrategy';

export const addConstraintIdsToFeatureChange = (change: IFeatureChange) => {
    if (isAddStrategyChange(change) || isUpdateStrategyChange(change)) {
        const { constraints, ...rest } = change.payload;
        return {
            ...change,
            payload: {
                ...rest,
                constraints: constraints.map((constraint) => ({
                    ...constraint,
                    [constraintId]: uuidv4(),
                })),
            },
        } as IFeatureChange;
    }
    return change;
};
