import { Box, styled } from '@mui/material';
import type { PlaygroundFeatureSchema } from 'openapi';
import { PlaygroundResultChip } from '../PlaygroundResultChip/PlaygroundResultChip.tsx';

interface IFeatureStatusCellProps {
    feature: PlaygroundFeatureSchema;
}

const StyledCellBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0, 1, 2),
}));

const StyledChipWrapper = styled(Box)(() => ({
    marginRight: 'auto',
}));

export const FeatureStatusCell = ({ feature }: IFeatureStatusCellProps) => {
    const [enabled, label]: [boolean | 'unknown', string] = (() => {
        if (feature?.isEnabled) {
            return [true, 'True'];
        }
        if (feature?.strategies?.result === 'unknown') {
            return ['unknown', 'Unknown'];
        }
        return [false, 'False'];
    })();

    return (
        <StyledCellBox>
            <StyledChipWrapper data-loading>
                <PlaygroundResultChip
                    enabled={enabled}
                    label={label}
                    showIcon={enabled !== 'unknown'}
                />
            </StyledChipWrapper>
        </StyledCellBox>
    );
};
