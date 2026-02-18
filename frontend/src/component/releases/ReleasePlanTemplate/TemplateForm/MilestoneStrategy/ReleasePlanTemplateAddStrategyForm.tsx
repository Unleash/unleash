import {
    Box,
    Button,
    styled,
    Alert,
    Tab,
    Tabs,
    Typography,
    Divider,
} from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import type { ISegment } from 'interfaces/segment';
import { useEffect, useState } from 'react';
import { formatStrategyName } from 'utils/strategyNames';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useFormErrors } from 'hooks/useFormErrors';
import produce from 'immer';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { MilestoneStrategyType } from './MilestoneStrategyType.tsx';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';
import {
    featureStrategyDocsLink,
    featureStrategyDocsLinkLabel,
    featureStrategyHelp,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { FeatureStrategyTitle } from 'component/feature/FeatureStrategy/FeatureStrategyForm/FeatureStrategyTitle/FeatureStrategyTitle.tsx';
import { FeatureStrategyConstraints } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/FeatureStrategyConstraints.tsx';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment.tsx';
import { useAssignableSegments } from 'hooks/api/getters/useSegments/useAssignableSegments.ts';
import { NewStrategyVariants } from 'component/feature/StrategyTypes/NewStrategyVariants.tsx';

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(6),
    paddingLeft: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

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

const StyledContentDiv = styled('div')(({ theme }) => ({
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

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    position: 'relative',
    marginTop: theme.spacing(3.5),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    width: '100%',
}));

const StyledConstraintSeparator = styled(ConstraintSeparator)(({ theme }) => ({
    top: '-10px',
    left: '0',
    transform: 'translateY(0)',
}));

interface IReleasePlanTemplateAddStrategyFormProps {
    onCancel: () => void;
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    onAddUpdateStrategy: (
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
    editMode: boolean;
}

export const ReleasePlanTemplateAddStrategyForm = ({
    onCancel,
    strategy,
    onAddUpdateStrategy,
    editMode,
}: IReleasePlanTemplateAddStrategyFormProps) => {
    const [currentStrategy, setCurrentStrategy] = useState(strategy);
    const [activeTab, setActiveTab] = useState(0);
    const { segments: allSegments } = useSegments();
    const { segments: assignableSegments = [] } = useAssignableSegments();
    const [segments, setSegments] = useState<ISegment[]>([]);
    const { strategyDefinition } = useStrategy(strategy?.strategyName);
    const hasValidConstraints = useConstraintsValidation(strategy?.constraints);
    const errors = useFormErrors();
    const showVariants = Boolean(
        currentStrategy?.parameters &&
            'stickiness' in currentStrategy?.parameters,
    );

    const showSegmentSelector =
        assignableSegments.length > 0 || segments.length > 0;

    const stickiness =
        currentStrategy?.parameters &&
        'stickiness' in currentStrategy?.parameters
            ? String(currentStrategy.parameters.stickiness)
            : 'default';

    const segmentsMap = allSegments?.reduce(
        (acc, segment) => {
            acc[segment.id] = segment;
            return acc;
        },
        {} as Record<string, ISegment>,
    );

    useEffect(() => {
        if (segmentsMap) {
            setSegments(
                (currentStrategy?.segments || []).map((segment) => {
                    return segmentsMap[segment];
                }),
            );
        }
    }, []);

    useEffect(() => {
        setCurrentStrategy((prev) => ({
            ...prev,
            segments: segments.map((segment) => segment.id),
        }));
    }, [segments]);

    useEffect(() => {
        setCurrentStrategy((prev) => ({
            ...prev,
            variants: (currentStrategy.variants || []).map((variant) => ({
                stickiness,
                name: variant.name,
                weight: variant.weight,
                payload: variant.payload,
                weightType: variant.weightType,
            })),
        }));
    }, [stickiness, JSON.stringify(currentStrategy.variants)]);

    if (!strategy || !currentStrategy || !strategyDefinition) {
        return null;
    }

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setActiveTab(newValue);
    };

    const getTargetingCount = () => {
        const constraintCount = currentStrategy?.constraints?.length || 0;
        const segmentCount = segments?.length || 0;

        return constraintCount + segmentCount;
    };

    const validateParameter = (_key: string, _value: string) => true;
    const updateParameter = (name: string, value: string) => {
        setCurrentStrategy(
            produce((draft) => {
                if (!draft) {
                    return;
                }
                if (name === 'title') {
                    draft.title = value;
                    return;
                }
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
                validateParameter(name, value);
            }),
        );
    };

    const AddUpdateMilestoneStrategy = () => {
        onAddUpdateStrategy(currentStrategy);
    };

    return (
        <FormTemplate
            modal
            disablePadding
            description={featureStrategyHelp}
            documentationLink={featureStrategyDocsLink}
            documentationLinkLabel={featureStrategyDocsLinkLabel}
        >
            <StyledHeaderBox>
                <StyledTitle>
                    {formatStrategyName(currentStrategy.strategyName || '')}
                    {currentStrategy.strategyName === 'flexibleRollout' && (
                        <Badge color='success' sx={{ marginLeft: '1rem' }}>
                            {currentStrategy.parameters?.rollout}%
                        </Badge>
                    )}
                </StyledTitle>
            </StyledHeaderBox>
            <StyledTabs value={activeTab} onChange={handleChange}>
                <StyledTab label='General' />
                <Tab
                    label={
                        <Typography>
                            Targeting
                            <StyledBadge>{getTargetingCount()}</StyledBadge>
                        </Typography>
                    }
                />
                {showVariants && (
                    <Tab
                        label={
                            <Typography>
                                Variants
                                <StyledBadge>
                                    {currentStrategy?.variants?.length || 0}
                                </StyledBadge>
                            </Typography>
                        }
                    />
                )}
            </StyledTabs>
            <StyledContentDiv>
                {activeTab === 0 && (
                    <>
                        <FeatureStrategyTitle
                            title={currentStrategy.title || ''}
                            setTitle={(title) =>
                                updateParameter('title', title)
                            }
                        />

                        <MilestoneStrategyType
                            strategy={currentStrategy}
                            strategyDefinition={strategyDefinition}
                            parameters={currentStrategy.parameters}
                            updateParameter={updateParameter}
                            errors={errors}
                        />
                    </>
                )}
                {activeTab === 1 && (
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
                            strategy={currentStrategy}
                            setStrategy={setCurrentStrategy}
                        />
                    </>
                )}
                {activeTab === 2 && showVariants && (
                    <NewStrategyVariants
                        strategy={currentStrategy}
                        setStrategy={setCurrentStrategy}
                        canRenamePreexistingVariants={true}
                    />
                )}
            </StyledContentDiv>
            <StyledButtonContainer>
                <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={!hasValidConstraints || errors.hasFormErrors()}
                    onClick={AddUpdateMilestoneStrategy}
                >
                    {editMode ? 'Add changes' : 'Add strategy'}
                </Button>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </FormTemplate>
    );
};
