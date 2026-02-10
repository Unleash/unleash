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
import { MilestoneStrategySegment } from 'component/releases/ReleasePlanTemplate/TemplateForm/MilestoneStrategy/MilestoneStrategySegment';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { MilestoneStrategyTitle } from 'component/releases/ReleasePlanTemplate/TemplateForm/MilestoneStrategy/MilestoneStrategyTitle';
import { MilestoneStrategyConstraints } from 'component/releases/ReleasePlanTemplate/TemplateForm/MilestoneStrategy/MilestoneStrategyConstraints';
import { MilestoneStrategyVariants } from 'component/releases/ReleasePlanTemplate/TemplateForm/MilestoneStrategy/MilestoneStrategyVariants';
import { MilestoneStrategyType } from 'component/releases/ReleasePlanTemplate/TemplateForm/MilestoneStrategy/MilestoneStrategyType';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';
import {
    featureStrategyDocsLink,
    featureStrategyDocsLinkLabel,
    featureStrategyHelp,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import useFeatureStrategyApi from 'hooks/api/actions/useFeatureStrategyApi/useFeatureStrategyApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

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

const StyledStrategyIdBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

interface IReleasePlanMilestoneStrategyEditFormProps {
    onCancel: () => void;
    strategy: IReleasePlanMilestoneStrategy;
    projectId: string;
    featureName: string;
    environmentId: string;
    onSuccess?: () => void;
}

export const ReleasePlanMilestoneStrategyEditForm = ({
    onCancel,
    strategy,
    projectId,
    featureName,
    environmentId,
    onSuccess,
}: IReleasePlanMilestoneStrategyEditFormProps) => {
    const [currentStrategy, setCurrentStrategy] =
        useState<IReleasePlanMilestoneStrategy>(strategy);
    const [activeTab, setActiveTab] = useState(0);
    const { segments: allSegments } = useSegments();
    const [segments, setSegments] = useState<ISegment[]>([]);
    const strategyName = strategy?.strategyName || strategy?.name || '';
    const { strategyDefinition } = useStrategy(strategyName);
    const hasValidConstraints = useConstraintsValidation(strategy?.constraints);
    const errors = useFormErrors();
    const { updateStrategyOnFeature, loading } = useFeatureStrategyApi();
    const { setToastData, setToastApiError } = useToast();
    const { addChange } = useChangeRequestApi();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);

    const showVariants = Boolean(
        currentStrategy?.parameters &&
            'stickiness' in currentStrategy?.parameters,
    );

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
        {} as Record<number, ISegment>,
    );

    useEffect(() => {
        if (segmentsMap && currentStrategy?.segments) {
            const resolvedSegments = currentStrategy.segments
                .map((segmentId) => {
                    if (typeof segmentId === 'number') {
                        return segmentsMap[segmentId];
                    }
                    return segmentsMap[Number(segmentId)];
                })
                .filter(Boolean) as ISegment[];
            setSegments(resolvedSegments);
        }
    }, [allSegments]);

    useEffect(() => {
        setCurrentStrategy((prev) => ({
            ...prev,
            segments: segments.map((segment) => segment.id),
        }));
    }, [segments]);

    useEffect(() => {
        if (showVariants) {
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
        }
    }, [stickiness]);

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

    const handleSave = async () => {
        try {
            const payload = {
                name: currentStrategy.strategyName || currentStrategy.name,
                title: currentStrategy.title || undefined,
                constraints: currentStrategy.constraints || [],
                parameters: currentStrategy.parameters || {},
                variants: currentStrategy.variants || [],
                segments: segments.map((segment) => segment.id),
                disabled: false,
            };

            if (isChangeRequestConfigured(environmentId)) {
                // Create a change request
                await addChange(projectId, environmentId, {
                    action: 'updateStrategy',
                    feature: featureName,
                    payload: { ...payload, id: strategy.id },
                });
                setToastData({
                    text: 'Change added to draft',
                    type: 'success',
                });
                refetchChangeRequests();
            } else {
                // Direct update
                await updateStrategyOnFeature(
                    projectId,
                    featureName,
                    environmentId,
                    strategy.id,
                    payload,
                );
                setToastData({
                    text: 'Strategy updated successfully',
                    type: 'success',
                });
            }

            onSuccess?.();
            onCancel();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
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
                    {formatStrategyName(strategyName)}
                    {strategyName === 'flexibleRollout' && (
                        <Badge color="success" sx={{ marginLeft: '1rem' }}>
                            {currentStrategy.parameters?.rollout}%
                        </Badge>
                    )}
                </StyledTitle>
            </StyledHeaderBox>
            <StyledTabs value={activeTab} onChange={handleChange}>
                <StyledTab label="General" />
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
                        <MilestoneStrategyTitle
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

                        <StyledStrategyIdBox>
                            <strong>Strategy ID:</strong> {strategy.id}
                            {strategy.milestoneId && (
                                <>
                                    {' '}
                                    | <strong>Milestone ID:</strong>{' '}
                                    {strategy.milestoneId}
                                </>
                            )}
                        </StyledStrategyIdBox>
                    </>
                )}
                {activeTab === 1 && (
                    <>
                        <Alert severity="info" sx={{ mb: 2 }} icon={false}>
                            Segmentation and constraints allow you to set
                            filters on your strategies, so that they will only
                            be evaluated for users and applications that match
                            the specified preconditions.
                        </Alert>
                        <MilestoneStrategySegment
                            segments={segments}
                            setSegments={setSegments}
                        />
                        <StyledBox>
                            <StyledDivider />
                            <StyledConstraintSeparator />
                        </StyledBox>
                        <MilestoneStrategyConstraints
                            strategy={currentStrategy}
                            setStrategy={
                                setCurrentStrategy as React.Dispatch<
                                    React.SetStateAction<
                                        Omit<
                                            IReleasePlanMilestoneStrategy,
                                            'milestoneId'
                                        >
                                    >
                                >
                            }
                        />
                    </>
                )}
                {activeTab === 2 && showVariants && (
                    <MilestoneStrategyVariants
                        strategy={currentStrategy}
                        setStrategy={
                            setCurrentStrategy as React.Dispatch<
                                React.SetStateAction<
                                    Omit<
                                        IReleasePlanMilestoneStrategy,
                                        'milestoneId'
                                    >
                                >
                            >
                        }
                    />
                )}
            </StyledContentDiv>
            <StyledButtonContainer>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={
                        !hasValidConstraints || errors.hasFormErrors() || loading
                    }
                    onClick={handleSave}
                >
                    {loading
                        ? 'Saving...'
                        : isChangeRequestConfigured(environmentId)
                          ? 'Add to change request'
                          : 'Save changes'}
                </Button>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </FormTemplate>
    );
};
