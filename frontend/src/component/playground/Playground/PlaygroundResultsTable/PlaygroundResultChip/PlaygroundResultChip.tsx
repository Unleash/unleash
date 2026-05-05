import FeatureEnabledIcon from 'assets/icons/isenabled-true.svg?react';
import FeatureDisabledIcon from 'assets/icons/isenabled-false.svg?react';
import { Badge } from 'component/common/Badge/Badge';
import type { FC } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

interface ResultChipProps {
    enabled: boolean | 'unevaluated' | 'unknown';
    label: string;
    // Result icon - defaults to true
    showIcon?: boolean;
}

const useIconAndColor = (
    enabled: boolean | 'unevaluated' | 'unknown',
): [any, any] => {
    if (enabled === 'unknown' || enabled === 'unevaluated') {
        return [InfoOutlined, 'info'];
    } else if (enabled === true) {
        return [FeatureEnabledIcon, 'success'];
    } else {
        return [FeatureDisabledIcon, 'error'];
    }
};

export const PlaygroundResultChip: FC<ResultChipProps> = ({
    enabled,
    label,
    showIcon = true,
}) => {
    const [Icon, color] = useIconAndColor(enabled);

    return (
        <Badge
            color={color}
            icon={
                showIcon ? (
                    <Icon aria-hidden color={color} strokeWidth='0.25' />
                ) : undefined
            }
        >
            {label}
        </Badge>
    );
};
