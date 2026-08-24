import { Badge } from 'component/common/Badge/Badge';
import type { OnboardingStatusSchema } from 'openapi';
import { getProjectOnboardingStep } from 'utils/getProjectOnboardingStep';

type IOnboardingStatusBadgeProps = {
    onboardingStatus: OnboardingStatusSchema;
};

export const OnboardingStatusBadge = ({
    onboardingStatus,
}: IOnboardingStatusBadgeProps) => {
    const { current, total } = getProjectOnboardingStep(onboardingStatus);
    return (
        <Badge color='primary' sx={{ fontWeight: 'normal' }}>
            Setup {current}/{total}
        </Badge>
    );
};
