import type { VFC } from 'react';
import ProPlanIcon from 'assets/icons/pro-enterprise-feature-badge.svg?react';
import ProPlanIconLight from 'assets/icons/pro-enterprise-feature-badge-light.svg?react';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';

type EnterpriseBadgeProps = {
    size?: number;
};

export const EnterpriseBadge: VFC<EnterpriseBadgeProps> = ({ size = 16 }) => (
    <ThemeMode
        darkmode={
            <ProPlanIconLight
                width={size}
                height={size}
                style={{ filter: 'grayscale(100%)', opacity: 0.51 }}
            />
        }
        lightmode={
            <ProPlanIcon
                width={size}
                height={size}
                style={{ filter: 'grayscale(100%)', opacity: 0.6 }}
            />
        }
    />
);
