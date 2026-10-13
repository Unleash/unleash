import type React from 'react';
import { useId, useMemo } from 'react';
import {
    Divider,
    Radio,
    RadioGroup,
    FormControlLabel,
    styled,
    alpha,
} from '@mui/material';
import type { StrategyFormState } from 'interfaces/strategy';
import type { ISegment } from 'interfaces/segment';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import { FeatureStrategyConstraints } from '../../FeatureStrategyConstraints/FeatureStrategyConstraints.tsx';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';
import { useAssignableSegments } from 'hooks/api/getters/useSegments/useAssignableSegments.ts';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';

export type TargetAudience = 'everyone' | 'subset';

export interface FeatureStrategyTargetAudienceProps<
    T extends StrategyFormState,
> {
    strategy: T;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    targetAudience: TargetAudience;
    onTargetAudienceChange: (targetAudience: TargetAudience) => void;
}

const StyledOptions = styled(RadioGroup)(({ theme }) => ({
    flexDirection: 'row',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
}));

const StyledOption = styled(FormControlLabel)(({ theme }) => ({
    flex: 1,
    alignItems: 'flex-start',
    margin: 0,
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'transparent',
    '&:has(:checked)': {
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
    '& .MuiRadio-root': {
        marginLeft: `-${theme.spacing(0.5)}`,
        marginTop: `-${theme.spacing(1.25)}`,
        marginRight: theme.spacing(0.5),
    },
}));

const StyledOptionLabel = styled('span')(({ theme }) => ({
    display: 'block',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
}));

const StyledOptionDescription = styled('span')(({ theme }) => ({
    display: 'block',
    marginTop: theme.spacing(0.375),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledBox = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1),
}));

const StyledRow = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledDividerBox = styled('div')({
    position: 'relative',
});

const StyledConstraintSeparator = styled(ConstraintSeparator)(({ theme }) => ({
    top: '0',
    left: theme.spacing(2),
    transform: 'translateY(-50%)',
    height: '22px',
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.primary.container,
    border: `1px solid ${theme.palette.primary.containerBorder}`,
    fontWeight: theme.fontWeight.bold,
    color: theme.palette.primary.onContainer,
}));

export const FeatureStrategyTargetAudience = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    targetAudience,
    onTargetAudienceChange,
}: FeatureStrategyTargetAudienceProps<T>) => {
    const { segments: assignableSegments = [] } = useAssignableSegments();
    const { segments: allSegments = [] } = useSegments();

    const segmentMap = useMemo(
        () => new Map(allSegments.map((s) => [s.id, s])),
        [allSegments],
    );

    const resolveSegments = (ids: number[]) =>
        ids
            .map((id) => segmentMap.get(id))
            .filter((s): s is ISegment => Boolean(s));

    const segments = resolveSegments(strategy.segments || []);

    const setSegments: React.Dispatch<React.SetStateAction<ISegment[]>> = (
        action,
    ) => {
        setStrategy((prev) => {
            const prevSegments = resolveSegments(prev.segments || []);
            const next =
                typeof action === 'function' ? action(prevSegments) : action;
            return { ...prev, segments: next.map((s) => s.id) };
        });
    };

    const showSegmentSelector =
        assignableSegments.length > 0 || (strategy.segments?.length ?? 0) > 0;

    const hasSegments = (strategy.segments?.length ?? 0) > 0;
    const hasConstraints = (strategy.constraints?.length ?? 0) > 0;

    const everyoneDescriptionId = useId();
    const subsetDescriptionId = useId();

    return (
        <>
            <StyledOptions
                value={targetAudience}
                onChange={(_, value) =>
                    onTargetAudienceChange(value as TargetAudience)
                }
            >
                <StyledOption
                    value='everyone'
                    control={
                        <Radio
                            slotProps={{
                                input: {
                                    'aria-label': 'Everyone',
                                    'aria-describedby': everyoneDescriptionId,
                                },
                            }}
                        />
                    }
                    label={
                        <>
                            <StyledOptionLabel>Everyone</StyledOptionLabel>
                            <StyledOptionDescription id={everyoneDescriptionId}>
                                The entire user base in production
                            </StyledOptionDescription>
                        </>
                    }
                />
                <StyledOption
                    value='subset'
                    control={
                        <Radio
                            slotProps={{
                                input: {
                                    'aria-label': 'A subset of users',
                                    'aria-describedby': subsetDescriptionId,
                                },
                            }}
                        />
                    }
                    label={
                        <>
                            <StyledOptionLabel>
                                A subset of users
                            </StyledOptionLabel>
                            <StyledOptionDescription id={subsetDescriptionId}>
                                Limit by segments or constraints
                            </StyledOptionDescription>
                        </>
                    }
                />
            </StyledOptions>

            {targetAudience === 'subset' ? (
                <StyledBox>
                    {showSegmentSelector ? (
                        <>
                            <StyledRow>
                                <FeatureStrategySegment
                                    segments={segments}
                                    setSegments={setSegments}
                                    availableSegments={assignableSegments}
                                />
                            </StyledRow>
                            <StyledDividerBox>
                                <Divider />
                                {hasSegments && hasConstraints ? (
                                    <StyledConstraintSeparator />
                                ) : null}
                            </StyledDividerBox>
                        </>
                    ) : null}
                    <StyledRow>
                        <FeatureStrategyConstraints
                            strategy={strategy}
                            setStrategy={setStrategy}
                        />
                    </StyledRow>
                </StyledBox>
            ) : null}
        </>
    );
};
