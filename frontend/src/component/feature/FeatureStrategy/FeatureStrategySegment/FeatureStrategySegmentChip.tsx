import type React from 'react';
import type { ISegment } from 'interfaces/segment';
import { Tooltip } from '@mui/material';
import { FeatureStrategyChip } from 'component/feature/FeatureStrategy/FeatureStrategyChip/FeatureStrategyChip';
import { FeatureStrategySegmentTooltipContent } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentTooltipContent';

interface IFeatureStrategySegmentChipProps {
    segment: ISegment;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

export const FeatureStrategySegmentChip = ({
    segment,
    setSegments,
}: IFeatureStrategySegmentChipProps) => {
    const onRemove = () => {
        setSegments((prev) => prev.filter((s) => s.id !== segment.id));
    };

    return (
        <FeatureStrategyChip
            label={
                <Tooltip
                    title={
                        <FeatureStrategySegmentTooltipContent
                            segment={segment}
                        />
                    }
                    arrow
                    slotProps={{
                        tooltip: {
                            sx: (theme) => ({
                                bgcolor: theme.palette.neutral.dark,
                                borderRadius: `${theme.shape.borderRadius}px`,
                                padding: theme.spacing(1, 1.25),
                            }),
                        },
                        arrow: {
                            sx: (theme) => ({
                                color: theme.palette.neutral.dark,
                            }),
                        },
                    }}
                >
                    <span>{segment.name}</span>
                </Tooltip>
            }
            onDelete={onRemove}
        />
    );
};
