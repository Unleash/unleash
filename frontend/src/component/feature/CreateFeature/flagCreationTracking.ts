import type { CreateFeatureSchemaType } from 'openapi';
import type { Lifetime } from 'component/feature/hooks/useFeatureForm';
import type { Tracking, TrackingProps } from 'utils/trackingEvents';

export const createFlagTracking: Tracking = {
    event: 'flag-creation',
    type: 'create-flag',
};

export const createFlagSubmitProps = ({
    type,
    lifetime,
    lifetimeDays,
    lifetimeChosenByUser,
}: {
    type: CreateFeatureSchemaType;
    lifetime: Lifetime | undefined;
    lifetimeDays: number | undefined;
    lifetimeChosenByUser: boolean;
}): TrackingProps => ({
    flagType: type,
    ...(lifetime && {
        lifetimeDays,
        lifetimeOption: lifetime.type,
        lifetimeSource: lifetimeChosenByUser ? 'chosen' : 'suggested',
    }),
});
