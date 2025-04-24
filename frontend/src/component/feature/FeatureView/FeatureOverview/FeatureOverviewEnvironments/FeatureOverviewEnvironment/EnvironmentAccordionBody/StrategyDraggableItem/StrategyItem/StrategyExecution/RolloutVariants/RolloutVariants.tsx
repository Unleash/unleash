import { styled } from '@mui/material';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { StrategyVariantSchema } from 'openapi';
import type { FC } from 'react';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
}));

const StyledVariantChip = styled(StrategyEvaluationChip)<{ order: number }>(
    ({ theme, order }) => ({
        borderRadius: theme.shape.borderRadiusExtraLarge,
        border: 'none',
        color: theme.palette.text.primary,
        background:
            theme.palette.variants[order % theme.palette.variants.length],
        fontWeight: theme.typography.fontWeightRegular,
    }),
);

const StyledPayloadHeader = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(1),
}));

const StyledTrack = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
}));

export const RolloutVariants: FC<{
    variants?: StrategyVariantSchema[];
}> = ({ variants }) => {
    if (!variants?.length) {
        return null;
    }

    return (
        <StyledContainer>
            <StrategyEvaluationItem type={`Variants (${variants.length})`}>
                <StyledTrack>
                    {variants.map((variant, i) => (
                        <HtmlTooltip
                            arrow
                            title={
                                variant.payload?.value ? (
                                    <div>
                                        <StyledPayloadHeader>
                                            Payload:
                                        </StyledPayloadHeader>
                                        <code>{variant.payload?.value}</code>
                                    </div>
                                ) : null
                            }
                            key={variant.name}
                        >
                            <StyledVariantChip
                                key={variant.name}
                                order={i}
                                label={
                                    <>
                                        <Truncator lines={1}>
                                            {variant.weight / 10}% –{' '}
                                            {variant.name}
                                        </Truncator>
                                    </>
                                }
                            />
                        </HtmlTooltip>
                    ))}
                </StyledTrack>
            </StrategyEvaluationItem>
        </StyledContainer>
    );
};
