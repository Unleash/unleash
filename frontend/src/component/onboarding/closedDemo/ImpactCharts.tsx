import { Box, styled, useTheme } from '@mui/material';
import {
    DEMO_COUNTRIES,
    type DemoFlagConfig,
    type DemoUser,
    type UserEvaluation,
} from './demoModel.js';
import { ImpactMetric } from './ImpactMetric.tsx';

// Total-revenue range. 78 at 0% exposure (all users on old checkout), 160 at
// 100% (all on the new one). Incident crashes it to zero. On the variants step
// total can climb slightly above 160 when the winning variant lifts the mean,
// so REVENUE_MAX gives headroom for that.
const REVENUE_NO_EXPOSURE = 78;
const REVENUE_FULL_EXPOSURE = 160;
const REVENUE_INCIDENT = 0;
const REVENUE_MAX = 260;

// Share of total revenue each country contributes. Weights sum to 1 so the
// per-country charts still add up to the total-revenue chart. US is dominant
// (matching the default target-step preset), the rest are a mix of
// mid-market and long-tail so targeting choices have visibly different impact.
const COUNTRY_WEIGHTS: Record<string, number> = {
    US: 0.3,
    GB: 0.2,
    DE: 0.15,
    IN: 0.15,
    BR: 0.1,
    JP: 0.1,
};
// Shared across all country charts so relative sizes are directly comparable
// (US bar is meant to look bigger than JP's). Sized to fit the largest
// full-exposure value (US: 0.30 × 160 = 48) with headroom.
const COUNTRY_REVENUE_MAX = 60;

const countryWeight = (code: string) =>
    COUNTRY_WEIGHTS[code] ?? 1 / DEMO_COUNTRIES.length;

// Per-variant conversion uplift vs. the baseline "new checkout" revenue. Small
// spread so the A/B chart differences are visible without dominating the story.
const VARIANT_UPLIFTS: Record<string, number> = {
    A: 0.95,
    B: 1.4,
    C: 0.9,
    D: 0.75,
};

const ERROR_HEALTHY = 1.5;
const ERROR_INCIDENT = 100;
const ERROR_MAX = 100;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const formatRevenue = (v: number) => `$${(v / 10).toFixed(1)}k`;
const formatErrorRate = (v: number) => `${v.toFixed(1)}%`;

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2),
}));

const StyledLabelWithFlag = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

interface IImpactChartsProps {
    /** The current topic key from TOPICS - drives which revenue breakdown to show. */
    topicKey: string;
    errorsActive: boolean;
    config: DemoFlagConfig;
    users: DemoUser[];
    evaluations: UserEvaluation[];
}

const variantShareOf = (
    variantName: string,
    users: DemoUser[],
    evaluations: UserEvaluation[],
) => {
    if (users.length === 0) return 0;
    const usersOnVariant = evaluations.filter(
        (e) => e.variant === variantName,
    ).length;
    return usersOnVariant / users.length;
};

const totalRevenueFor = (
    topicKey: string,
    errorsActive: boolean,
    config: DemoFlagConfig,
    users: DemoUser[],
    evaluations: UserEvaluation[],
) => {
    if (errorsActive) return REVENUE_INCIDENT;
    if (topicKey === 'variants' && config.variants.length > 0) {
        // On the variants step, total is the sum of each variant's contribution
        // (share × uplift × full-exposure baseline) so an A/B winner visibly
        // moves the top-line number.
        return config.variants.reduce((sum, v) => {
            const share = variantShareOf(v.name, users, evaluations);
            const uplift = VARIANT_UPLIFTS[v.name] ?? 1;
            return sum + REVENUE_FULL_EXPOSURE * share * uplift;
        }, 0);
    }
    // Sum per-country contributions weighted by that country's share of total
    // revenue. This makes targeting a big market (US) move the top-line more
    // than targeting a small one (JP) - and keeps the per-country charts
    // adding up to what the total shows.
    return DEMO_COUNTRIES.reduce((sum, country) => {
        const countryUsers = users.filter(
            (u) => u.country.code === country.code,
        );
        const enabledInCountry = countryUsers.filter(
            (u) => evaluations[users.indexOf(u)]?.enabled,
        ).length;
        const exposure = countryUsers.length
            ? enabledInCountry / countryUsers.length
            : 0;
        const weight = countryWeight(country.code);
        const baseline = REVENUE_NO_EXPOSURE * weight;
        const full = REVENUE_FULL_EXPOSURE * weight;
        return sum + lerp(baseline, full, exposure);
    }, 0);
};

/**
 * Composes the impact-metric cards for the current step. Total revenue and
 * error rate are always shown. Step 3 additionally shows one revenue chart per
 * country (all six, always) so it's visible which countries the flag is
 * currently pushing revenue in. Step 4 shows one chart per configured variant,
 * following the user's add/remove actions. Revenue charts seed at their
 * baseline so growth toward the exposed target is a visible animation, not a
 * fait accompli on mount.
 */
export const ImpactCharts = ({
    topicKey,
    errorsActive,
    config,
    users,
    evaluations,
}: IImpactChartsProps) => {
    const theme = useTheme();
    const successColor = theme.palette.success.main;
    const errorColor = theme.palette.error.main;

    const totalTarget = totalRevenueFor(
        topicKey,
        errorsActive,
        config,
        users,
        evaluations,
    );
    const errorTarget = errorsActive ? ERROR_INCIDENT : ERROR_HEALTHY;

    const breakdowns = (() => {
        if (topicKey === 'target') {
            return DEMO_COUNTRIES.map((country) => {
                const countryUsers = users.filter(
                    (u) => u.country.code === country.code,
                );
                const enabledInCountry = countryUsers.filter(
                    (u) => evaluations[users.indexOf(u)]?.enabled,
                ).length;
                const exposure = countryUsers.length
                    ? enabledInCountry / countryUsers.length
                    : 0;
                const weight = countryWeight(country.code);
                const baseline = REVENUE_NO_EXPOSURE * weight;
                const full = REVENUE_FULL_EXPOSURE * weight;
                const target = lerp(baseline, full, exposure);
                return (
                    <ImpactMetric
                        key={country.code}
                        label={
                            <StyledLabelWithFlag>
                                <span>{country.flag}</span>
                                {country.code} revenue
                            </StyledLabelWithFlag>
                        }
                        target={target}
                        initialValue={baseline}
                        max={COUNTRY_REVENUE_MAX}
                        color={successColor}
                        formatValue={formatRevenue}
                    />
                );
            });
        }

        if (topicKey === 'variants' && config.variants.length > 0) {
            // All variant charts share a max so their bar heights are directly
            // comparable. Peg it to the highest-uplift variant with headroom.
            const evenShare = 1 / config.variants.length;
            const maxUplift = Math.max(
                ...config.variants.map((v) => VARIANT_UPLIFTS[v.name] ?? 1),
            );
            const variantMax =
                REVENUE_FULL_EXPOSURE * evenShare * maxUplift * 1.3;

            return config.variants.map((v) => {
                const share = variantShareOf(v.name, users, evaluations);
                const uplift = VARIANT_UPLIFTS[v.name] ?? 1;
                const target = REVENUE_FULL_EXPOSURE * share * uplift;
                // Seed at the no-uplift baseline for this variant's share so
                // the chart visibly diverges toward its uplifted target -
                // that's the whole point of A/B testing.
                const uniformSeed = REVENUE_FULL_EXPOSURE * share;
                return (
                    <ImpactMetric
                        key={v.name}
                        label={`Variant ${v.name}`}
                        target={target}
                        initialValue={uniformSeed}
                        max={variantMax}
                        color={v.color ?? successColor}
                        formatValue={formatRevenue}
                    />
                );
            });
        }

        return null;
    })();

    return (
        <StyledGrid data-testid='CLOSED_DEMO_IMPACT_CHARTS'>
            <ImpactMetric
                label='Revenue / min'
                target={totalTarget}
                initialValue={REVENUE_NO_EXPOSURE}
                max={REVENUE_MAX}
                color={successColor}
                formatValue={formatRevenue}
            />
            <ImpactMetric
                label='Error rate'
                target={errorTarget}
                initialValue={ERROR_HEALTHY}
                max={ERROR_MAX}
                color={errorColor}
                formatValue={formatErrorRate}
            />
            {breakdowns}
        </StyledGrid>
    );
};
