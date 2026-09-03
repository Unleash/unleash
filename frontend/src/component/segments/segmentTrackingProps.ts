import type { Tracking } from 'utils/trackingEvents';
import { isMultiValueOperator } from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';

const constraintValueCount = ({ operator, values, value }: IConstraint) =>
    isMultiValueOperator(operator)
        ? (values?.length ?? 0)
        : Number(Boolean(value));

// Constraint values may identify the customer's end users, so only their
// counts are captured; the configuration itself is captured whole.
const summarizeSegmentConstraint = (constraint: IConstraint) => ({
    contextName: constraint.contextName,
    operator: constraint.operator,
    valueCount: constraintValueCount(constraint),
});

// Shared by create, edit and delete so the shapes stay comparable across the lifecycle.
export const segmentTrackingProps = ({
    name,
    id,
    constraints,
    description,
}: {
    name: string;
    id?: number;
    constraints: IConstraint[];
    description?: string;
}) => ({
    name,
    id,
    constraintsCount: constraints.length,
    constraintValuesCount: constraints.reduce(
        (total, constraint) => total + constraintValueCount(constraint),
        0,
    ),
    constraints: constraints.map(summarizeSegmentConstraint),
    hasDescription: Boolean(description?.trim()),
});

// Edit-only: booleans comparing submitted form state against the values the
// form was loaded with; before/after values live in the admin event log.
export const segmentChangedProps = ({
    name,
    description,
    constraints,
    initial,
}: {
    name: string;
    description?: string;
    constraints: IConstraint[];
    initial: {
        name?: string;
        description?: string;
        constraints?: IConstraint[];
    };
}) => ({
    nameChanged: name !== (initial.name ?? ''),
    descriptionChanged: (description ?? '') !== (initial.description ?? ''),
    constraintsChanged:
        JSON.stringify(constraints) !==
        JSON.stringify(initial.constraints ?? []),
});

export const segmentCreatedTracking: Tracking = {
    event: 'segments',
    type: 'created',
};

export const segmentEditedTracking: Tracking = {
    event: 'segments',
    type: 'edited',
};
