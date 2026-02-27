import type React from 'react';
import { useEffect, useState } from 'react';
import {
    Alert,
    Tab,
    Box,
    Divider,
    Tabs,
    Typography,
    styled,
} from '@mui/material';
import type {
    IFeatureStrategyParameters,
    IStrategy,
    StrategyFormState,
} from 'interfaces/strategy';
import produce from 'immer';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType.tsx';
import { FeatureStrategyConstraints } from '../FeatureStrategyConstraints/FeatureStrategyConstraints.tsx';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import type { ISegment } from 'interfaces/segment';
import type { IFormErrors } from 'hooks/useFormErrors';
import { FeatureStrategyTitle } from './FeatureStrategyTitle/FeatureStrategyTitle.tsx';
import { formatStrategyName } from 'utils/strategyNames';
import { Badge } from 'component/common/Badge/Badge';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';
import { useAssignableSegments } from 'hooks/api/getters/useSegments/useAssignableSegments.ts';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { NewStrategyVariants } from 'component/feature/StrategyTypes/NewStrategyVariants';

export interface StrategyFormBodyProps<T extends StrategyFormState> {
    strategy: T;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    strategyDefinition: IStrategy;
    errors: IFormErrors;

    validateParameter?: (
        name: string,
        value: IFeatureStrategyParameters[string],
    ) => void;
    canRenamePreexistingVariants?: boolean;

    alertContent?: React.ReactNode;
    generalTabExtras?: React.ReactNode;
    beforeFooter?: React.ReactNode;
    children?: React.ReactNode;

    onSubmit?: (event: React.FormEvent) => void;
}

const StyledHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    minHeight: '60px',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    width: '100px',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    position: 'relative',
    marginTop: theme.spacing(3.5),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    width: '100%',
}));

const StyledConstraintSeparator = styled(ConstraintSeparator)({
    top: '-10px',
    left: '0',
    transform: 'translateY(0)',
});

const StyledForm = styled('form')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(6),
    paddingBottom: theme.spacing(16),
    paddingTop: theme.spacing(4),
    overflow: 'auto',
    height: '100%',
}));

const StyledButtons = styled('div')(({ theme }) => ({
    bottom: 0,
    right: 0,
    left: 0,
    position: 'absolute',
    display: 'flex',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'end',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const StrategyFormBody = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    strategyDefinition,
    errors,
    validateParameter,
    canRenamePreexistingVariants,
    alertContent,
    generalTabExtras,
    beforeFooter,
    children,
    onSubmit,
}: StrategyFormBodyProps<T>) => {
    const [tab, setTab] = useState(0);
    const strategyName = strategy?.name || strategy?.strategyName;
    const { segments: assignableSegments = [] } = useAssignableSegments();

    const { segments: allSegments } = useSegments();
    const [segments, setSegments] = useState<ISegment[]>([]);

    useEffect(() => {
        if (allSegments) {
            const segmentMap = new Map(allSegments.map((s) => [s.id, s]));
            setSegments(
                (strategy.segments || [])
                    .map((id) => segmentMap.get(id))
                    .filter((s): s is ISegment => Boolean(s)),
            );
        }
    }, []);

    useEffect(() => {
        setStrategy((prev) => ({
            ...prev,
            segments: segments.map((s) => s.id),
        }));
    }, [segments]);

    const showSegmentSelector =
        assignableSegments.length > 0 || segments.length > 0;

    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';

    useEffect(() => {
        setStrategy((prev) => ({
            ...prev,
            variants: (strategy.variants || []).map((variant) => ({
                stickiness,
                name: variant.name,
                weight: variant.weight,
                payload: variant.payload,
                weightType: variant.weightType,
            })),
        }));
    }, [stickiness, JSON.stringify(strategy.variants)]);

    const showVariants = Boolean(
        strategy.parameters && 'stickiness' in strategy.parameters,
    );

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTab(newValue);
    };

    const getTargetingCount = () => {
        const constraintCount = strategy.constraints?.length || 0;
        const segmentCount = segments.length || 0;

        return constraintCount + segmentCount;
    };

    const updateParameter = (name: string, value: string) => {
        setStrategy(
            produce((draft) => {
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
            }),
        );
        validateParameter?.(name, value);
    };

    const handleTitleChange = (title: string) => {
        setStrategy((prev) => ({
            ...prev,
            title,
        }));
    };

    return (
        <>
            <StyledHeaderBox>
                <StyledTitle>
                    {formatStrategyName(strategyName || '')}
                </StyledTitle>
            </StyledHeaderBox>

            {alertContent}

            <StyledTabs value={tab} onChange={handleChange}>
                <StyledTab label='General' />
                <Tab
                    data-testid='STRATEGY_TARGETING_TAB'
                    label={
                        <Typography>
                            Targeting
                            <StyledBadge>{getTargetingCount()}</StyledBadge>
                        </Typography>
                    }
                />
                {showVariants && (
                    <Tab
                        data-testid='STRATEGY_VARIANTS_TAB'
                        label={
                            <Typography>
                                Variants
                                <StyledBadge>
                                    {strategy.variants?.length || 0}
                                </StyledBadge>
                            </Typography>
                        }
                    />
                )}
            </StyledTabs>

            <StyledForm onSubmit={onSubmit}>
                {tab === 0 && (
                    <>
                        <FeatureStrategyTitle
                            title={strategy.title || ''}
                            setTitle={handleTitleChange}
                        />

                        <FeatureStrategyType
                            strategy={strategy}
                            strategyDefinition={strategyDefinition}
                            updateParameter={updateParameter}
                            errors={errors}
                        />

                        {generalTabExtras}
                    </>
                )}

                {tab === 1 && (
                    <>
                        <Alert severity='info' sx={{ mb: 2 }} icon={false}>
                            Segmentation and constraints allow you to set
                            filters on your strategies, so that they will only
                            be evaluated for users and applications that match
                            the specified preconditions.
                        </Alert>

                        {showSegmentSelector ? (
                            <>
                                <FeatureStrategySegment
                                    segments={segments}
                                    setSegments={setSegments}
                                    availableSegments={assignableSegments}
                                />

                                <StyledBox>
                                    <StyledDivider />
                                    <StyledConstraintSeparator />
                                </StyledBox>
                            </>
                        ) : null}
                        <FeatureStrategyConstraints
                            strategy={strategy}
                            setStrategy={setStrategy}
                        />
                    </>
                )}

                {tab === 2 && showVariants && (
                    <NewStrategyVariants
                        strategy={strategy}
                        setStrategy={setStrategy}
                        canRenamePreexistingVariants={
                            canRenamePreexistingVariants
                        }
                    />
                )}

                {beforeFooter}

                <StyledButtons>{children}</StyledButtons>
            </StyledForm>
        </>
    );
};
