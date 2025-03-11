import { styled } from '@mui/material';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { StrategyEvaluationItem } from 'component/common/ConstraintsList/StrategyEvaluationItem/StrategyEvaluationItem';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { useThemeMode } from 'hooks/useThemeMode';
import type { StrategyVariantSchema } from 'openapi';
import type { FC } from 'react';

const StyledVariantChip = styled(StrategyEvaluationChip)<{ order: number }>(
    ({ theme, order }) => ({
        borderRadius: theme.shape.borderRadiusExtraLarge,
        border: 'none',
        background:
            theme.palette.variants[order % theme.palette.variants.length],
        color:
            theme.mode === 'dark'
                ? theme.palette.neutral.light
                : theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
    }),
);

const StyledPayloadHeader = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(1),
}));

export const RolloutVariants: FC<{
    variants?: StrategyVariantSchema[];
}> = ({ variants }) => {
    if (!variants?.length) {
        return null;
    }
    const { themeMode } = useThemeMode();

    return (
        <StrategyEvaluationItem type={`Variants (${variants.length})`}>
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
