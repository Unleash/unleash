import type { VFC } from 'react';
import { PlaygroundResultChip as NewPlaygroundResultChip } from './PlaygroundResultChip';

interface IResultChipProps {
    enabled: boolean | 'unevaluated' | 'unknown';
    label: string;
    // Result icon - defaults to true
    showIcon?: boolean;
}

/**
 * @deprecated remove with 'flagOverviewRedesign' flag. This pollutes a lot of places in the codebase 😞
 */
export const PlaygroundResultChip: VFC<IResultChipProps> = ({
    enabled,
    label,
    showIcon = true,
}) => (
    <NewPlaygroundResultChip
        enabled={enabled}
        label={label}
        showIcon={showIcon}
    />
);
