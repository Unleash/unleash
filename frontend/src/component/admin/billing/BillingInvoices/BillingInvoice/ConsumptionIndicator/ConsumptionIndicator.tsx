import type { FC } from 'react';
import { PercentageDonut } from 'component/common/PercentageCircle/PercentageDonut';

type ConsumptionIndicatorProps = {
    percentage: number;
};

export const ConsumptionIndicator: FC<ConsumptionIndicatorProps> = ({
    percentage,
}) => {
    return (
        <PercentageDonut
            percentage={percentage}
            size={'1.25rem'}
            strokeRatio={0.3}
        />
    );
};
