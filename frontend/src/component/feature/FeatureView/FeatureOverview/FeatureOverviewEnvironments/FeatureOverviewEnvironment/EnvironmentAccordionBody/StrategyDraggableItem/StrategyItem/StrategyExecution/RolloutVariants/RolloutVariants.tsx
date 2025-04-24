import { styled } from '@mui/material';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import { VariantsSplitPreview } from 'component/common/VariantsSplitPreview/VariantsSplitPreview';
import type { StrategyVariantSchema } from 'openapi';
import type { FC } from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(3.5, 2, 0.5),
}));

const StyledTrack = styled('div')(() => ({
    width: '100%',
    position: 'relative',
}));

export const RolloutVariants: FC<{
    variants?: StrategyVariantSchema[];
    selected?: StrategyVariantSchema['name'];
}> = ({ variants, selected }) => {
    if (!variants?.length) {
        return null;
    }

    return (
        <StyledContainer>
            <StrategyEvaluationItem
                type={`Variants (${variants.length})`}
                alignType='top'
            >
                <StyledTrack>
                    <VariantsSplitPreview
                        variants={variants}
                        header={false}
                        selected={selected}
                    />
                </StyledTrack>
            </StrategyEvaluationItem>
        </StyledContainer>
    );
};
