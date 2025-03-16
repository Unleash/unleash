import { styled } from '@mui/material';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type { StrategyVariantSchema } from 'openapi';
import type { FC } from 'react';

const StyledVariantChip = styled(StrategyEvaluationChip)<{ order: number }>(
    ({ theme, order }) => {
        const variantColor =
            theme.palette.variants[order % theme.palette.variants.length];

        return {
            borderRadius: theme.shape.borderRadiusExtraLarge,
            border: 'none',
            color: theme.palette.text.primary,
            background:
                // TODO: adjust theme.palette.variants
                theme.mode === 'dark'
                    ? `hsl(from ${variantColor} h calc(s - 30) calc(l - 45))`
                    : `hsl(from ${variantColor} h s calc(l + 5))`,
            fontWeight: theme.typography.fontWeightRegular,
        };
    },
);

const StyledPayloadHeader = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(1),
}));

export const RolloutVariants: FC<{
    variants?: StrategyVariantSchema[];
    reduceMargin?: boolean;
}> = ({ variants, reduceMargin }) => {
    if (!variants?.length) {
        return null;
    }

    return (
        <StrategyEvaluationItem type={`Variants (${variants.length})`} reduceMargin={reduceMargin}>
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
                                <span>
                                    {variant.weight / 10}% – {variant.name}
                                </span>
                            </>
                        }
                    />
                </HtmlTooltip>
            ))}
        </StrategyEvaluationItem>
    );
};
