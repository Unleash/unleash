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
import { MilestoneStrategyTitle } from './MilestoneStrategyTitle';
import { MilestoneStrategyType } from './MilestoneStrategyType';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { useFormErrors } from 'hooks/useFormErrors';
import produce from 'immer';
import { MilestoneStrategySegment } from './MilestoneStrategySegment';
import { MilestoneStrategyConstraints } from './MilestoneStrategyConstraints';
import { MilestoneStrategyVariants } from './MilestoneStrategyVariants';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
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
    milestoneId: string | undefined;
    onCancel: () => void;
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    onAddStrategy: (
        milestoneId: string,
        strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>,
    ) => void;
}

export const ReleasePlanTemplateAddStrategyForm = ({
    milestoneId,
    onCancel,
    strategy,
    onAddStrategy,
}: IReleasePlanTemplateAddStrategyFormProps) => {
    const [addStrategy, setAddStrategy] = useState(strategy);
    const [activeTab, setActiveTab] = useState(0);
    const [segments, setSegments] = useState<ISegment[]>([]);
    const { strategyDefinition } = useStrategy(strategy?.name);
    const hasValidConstraints = useConstraintsValidation(strategy?.constraints);
    const errors = useFormErrors();
    const showVariants = Boolean(
        addStrategy?.parameters && 'stickiness' in addStrategy?.parameters,
    );

    const stickiness =
        addStrategy?.parameters && 'stickiness' in addStrategy?.parameters
            ? String(addStrategy.parameters.stickiness)
            : 'default';

    useEffect(() => {
        setAddStrategy((prev) => ({
            ...prev,
            variants: (addStrategy.variants || []).map((variant) => ({
                stickiness,
                name: variant.name,
                weight: variant.weight,
                payload: variant.payload,
                weightType: variant.weightType,
            })),
        }));
    }, [stickiness, JSON.stringify(addStrategy.variants)]);

    if (!strategy || !addStrategy || !strategyDefinition) {
        return null;
    }

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setActiveTab(newValue);
    };

    const getTargetingCount = () => {
        const constraintCount = addStrategy?.constraints?.length || 0;
        const segmentCount = segments?.length || 0;

        return constraintCount + segmentCount;
    };

    const validateParameter = (key: string, value: string) => true;
    const updateParameter = (name: string, value: string) => {
        setAddStrategy(
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

    const addStrategyToMilestone = () => {
        if (!milestoneId) {
            return;
        }
        onAddStrategy(milestoneId, addStrategy);
    };

    return (
        <FormTemplate
            modal
            description='Add a strategy to your release plan template.'
        >
            <StyledHeaderBox>
                <StyledTitle>
                    {formatStrategyName(addStrategy.name || '')}
                    {addStrategy.name === 'flexibleRollout' && (
                        <Badge color='success' sx={{ marginLeft: '1rem' }}>
                            {addStrategy.parameters?.rollout}%
                        </Badge>
                    )}
                </StyledTitle>
            </StyledHeaderBox>
            {!BuiltInStrategies.includes(strategy.name || 'default') && (
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
                                    {addStrategy?.variants?.length || 0}
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
                            title={addStrategy.title || ''}
                            setTitle={(title) =>
                                updateParameter('title', title)
                            }
                        />

                        <MilestoneStrategyType
                            strategy={addStrategy}
                            strategyDefinition={strategyDefinition}
                            parameters={addStrategy.parameters}
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
                            <MilestoneStrategySegment
                                segments={segments}
                                setSegments={setSegments}
                            />
                            <StyledBox>
                                <StyledDivider />
                                <StyledDividerContent>AND</StyledDividerContent>
                            </StyledBox>
                            <MilestoneStrategyConstraints
                                strategy={addStrategy}
                                setStrategy={setAddStrategy}
                            />
                            be evaluated for users and applications that match
                            the specified preconditions.
                        </StyledTargetingHeader>
                    </>
                )}
                {activeTab === 2 && showVariants && (
                    <MilestoneStrategyVariants
                        strategy={addStrategy}
                        setStrategy={setAddStrategy}
                    />
                )}
            </StyledContentDiv>
            <StyledButtonContainer>
                <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    disabled={!hasValidConstraints || errors.hasFormErrors()}
                    onClick={addStrategyToMilestone}
                >
                    Save strategy
                </Button>
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </FormTemplate>
    );
};
