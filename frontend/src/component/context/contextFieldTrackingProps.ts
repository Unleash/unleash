import type { Tracking } from 'utils/trackingEvents';
import type { ILegalValue } from 'interfaces/context';

export type ContextFieldTrackingProps = {
    name: string;
    legalValuesCount: number;
    hasDescription: boolean;
    customStickiness: boolean;
};

// Shared by create and edit so the shapes stay comparable across the lifecycle.
export const contextFieldTrackingProps = ({
    name,
    legalValues,
    description,
    stickiness,
}: {
    name: string;
    legalValues: ILegalValue[];
    description?: string;
    stickiness: boolean;
}): ContextFieldTrackingProps => ({
    name,
    legalValuesCount: legalValues.length,
    hasDescription: Boolean(description?.trim()),
    customStickiness: stickiness,
});

// Edit-only: booleans comparing submitted form state against the values the
// form was loaded with; before/after values live in the admin event log.
export const contextFieldChangedProps = ({
    description,
    legalValues,
    stickiness,
    initial,
}: {
    description?: string;
    legalValues: ILegalValue[];
    stickiness: boolean;
    initial: {
        description?: string;
        legalValues?: ILegalValue[];
        stickiness?: boolean;
    };
}) => ({
    descriptionChanged: (description ?? '') !== (initial.description ?? ''),
    legalValuesChanged:
        JSON.stringify(legalValues) !==
        JSON.stringify(initial.legalValues ?? []),
    stickinessChanged: Boolean(stickiness) !== Boolean(initial.stickiness),
});

export const contextFieldCreatedTracking: Tracking = {
    event: 'context-fields',
    type: 'created',
};

export const contextFieldEditedTracking: Tracking = {
    event: 'context-fields',
    type: 'edited',
};
