import { styled } from '@mui/material';
import { disabledStrategyClassName } from '../StrategyItemContainer/disabled-strategy-utils.ts';

const Chip = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    fontSize: theme.fontSizes.smallerBody,
    position: 'absolute',
    zIndex: theme.zIndex.fab,
    top: 0,
    transform: 'translateY(-50%)',
    lineHeight: 1,
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.secondary.border,
    left: theme.spacing(4),

    // if the strategy it's applying to is disabled
    [`&:has(+ * .${disabledStrategyClassName}, + .${disabledStrategyClassName})`]:
        {
            filter: 'grayscale(.8)',
        },
}));

export const StrategySeparator = () => {
    return <Chip role='separator'>OR</Chip>;
};
