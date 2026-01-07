import type { ChangeRequestState } from 'component/changeRequest/changeRequest.types';

export const stepsFromTimestamps = (
    timestamps: Partial<Record<ChangeRequestState, unknown>>,
    currentState: Extract<ChangeRequestState, 'Cancelled' | 'Rejected'>,
): ChangeRequestState[] => {
    const optionalSteps: ChangeRequestState[] = [
        'Approved',
        'Applied',
        'Cancelled',
        'Scheduled',
        'Rejected',
    ];

    return [
        'Draft',
        'In review',
        ...optionalSteps.filter(
            (step) => timestamps.hasOwnProperty(step) || step === currentState,
        ),
    ];
};

export const steps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Applied',
];

export const rejectedSteps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Rejected',
];
export const cancelledSteps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Cancelled',
];

export const scheduledSteps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Scheduled',
    'Applied',
];
