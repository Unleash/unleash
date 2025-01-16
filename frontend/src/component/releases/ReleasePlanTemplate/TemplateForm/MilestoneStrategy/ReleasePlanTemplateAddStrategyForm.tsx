import {
    Box,
    Button,
    styled,
    Alert,
    Link,
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
import { BuiltInStrategies, formatStrategyName } from 'utils/strategyNames';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useFormErrors } from 'hooks/useFormErrors';
import produce from 'immer';
import { MilestoneStrategySegment } from './MilestoneStrategySegment';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { MilestoneStrategyTitle } from './MilestoneStrategyTitle';
import { MilestoneStrategyConstraints } from './MilestoneStrategyConstraints';
import { MilestoneStrategyVariants } from './MilestoneStrategyVariants';
import { MilestoneStrategyType } from './MilestoneStrategyType';
import {
    featureStrategyDocsLink,
    featureStrategyDocsLinkLabel,
    featureStrategyHelp,
} from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';

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

const StyledAlertBox = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    '& > *': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
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

const StyledTargetingHeader = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1.5),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    width: '100%',
}));

const StyledDividerContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0.75, 1),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallerBody,
    backgroundColor: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadius,
    width: '45px',
    position: 'absolute',
    top: '-10px',
    left: 'calc(50% - 45px)',
    lineHeight: 1,
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
    const { segments: allSegments, refetchSegments } = useSegments();
    const [segments, setSegments] = useState<ISegment[]>([]);
    const { strategyDefinition } = useStrategy(strategy?.strategyName);
    const hasValidConstraints = useConstraintsValidation(strategy?.constraints);
    const errors = useFormErrors();
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

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setActiveTab(newValue);
    };

    const getTargetingCount = () => {
        const constraintCount = currentStrategy?.constraints?.length || 0;
        const segmentCount = segments?.length || 0;

        return constraintCount + segmentCount;
    };

    const validateParameter = (key: string, value: string) => true;
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
            {!BuiltInStrategies.includes(
                strategy.strategyName || 'default',
            ) && (
                <StyledAlertBox>
                    <Alert severity='warning'>
                        Custom strategies are deprecated. We recommend not
                        adding them to any templates going forward and using the
                        predefined strategies like Gradual rollout with{' '}
                        <Link
                            href={
                                'https://docs.getunleash.io/reference/strategy-constraints'
                            }
                            target='_blank'
                            variant='body2'
                        >
                            constraints
                        </Link>{' '}
                        instead.
                    </Alert>
                </StyledAlertBox>
            )}
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
                    </>
                )}
                {activeTab === 1 && (
                    <>
                        <StyledTargetingHeader>
                            Segmentation and constraints allow you to set
                            filters on your strategies, so that they will only
                            be evaluated for users and applications that match
                            the specified preconditions.
                            <MilestoneStrategySegment
                                segments={segments}
                                setSegments={setSegments}
                            />
                            <StyledBox>
                                <StyledDivider />
                                <StyledDividerContent>AND</StyledDividerContent>
                            </StyledBox>
                            <MilestoneStrategyConstraints
                                strategy={currentStrategy}
                                setStrategy={setCurrentStrategy}
                            />
                        </StyledTargetingHeader>
                    </>
                )}
                {activeTab === 2 && showVariants && (
                    <MilestoneStrategyVariants
                        strategy={currentStrategy}
                        setStrategy={setCurrentStrategy}
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
