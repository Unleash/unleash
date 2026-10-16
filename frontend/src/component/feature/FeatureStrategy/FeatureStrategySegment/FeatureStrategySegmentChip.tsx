import type React from 'react';
import type { ISegment } from 'interfaces/segment';
import Clear from '@mui/icons-material/Clear';
import { styled, type Theme, Tooltip } from '@mui/material';
import { FeatureStrategySegmentTooltipContent } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentTooltipContent';

interface IFeatureStrategySegmentChipProps {
    segment: ISegment;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

const StyledChip = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingInlineStart: theme.spacing(2),
    paddingInlineEnd: theme.spacing(1),
    height: '30px',
    borderRadius: '100rem',
    background: theme.palette.background.elevation1,
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledButton = styled('button')(({ theme }) => ({
    all: 'unset',
    height: theme.spacing(2),
    cursor: 'pointer',
    color: theme.palette.primary.onContainer,
}));

const styledIcon = (theme: Theme) => ({ fontSize: theme.fontSizes.bodySize });

export const FeatureStrategySegmentChip = ({
    segment,
    setSegments,
}: IFeatureStrategySegmentChipProps) => {
    const onRemove = () => {
        setSegments((prev) => prev.filter((s) => s.id !== segment.id));
    };

    return (
        <StyledChip>
            <Tooltip
                title={
                    <FeatureStrategySegmentTooltipContent segment={segment} />
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
            <Tooltip title='Remove segment' arrow>
                <StyledButton type='button' onClick={onRemove}>
                    <Clear titleAccess='Remove' sx={styledIcon} />
                </StyledButton>
            </Tooltip>
        </StyledChip>
    );
};
