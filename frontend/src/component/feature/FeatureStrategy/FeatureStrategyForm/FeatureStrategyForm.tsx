import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Button,
    styled,
    Tabs,
    Tab,
    Box,
    Divider,
    Typography,
} from '@mui/material';
import type {
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType.tsx';
import { FeatureStrategyEnabled } from './FeatureStrategyEnabled/FeatureStrategyEnabled.tsx';
import { FeatureStrategyConstraints } from '../FeatureStrategyConstraints/FeatureStrategyConstraints.tsx';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { FeatureStrategySegment } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment';
import type { ISegment } from 'interfaces/segment';
import type { IFormErrors } from 'hooks/useFormErrors';
import { validateParameterValue } from 'utils/validateParameterValue';
import { useStrategy } from 'hooks/api/getters/useStrategy/useStrategy';
import { FeatureStrategyChangeRequestAlert } from './FeatureStrategyChangeRequestAlert/FeatureStrategyChangeRequestAlert.tsx';
import {
    FeatureStrategyProdGuard,
    useFeatureStrategyProdGuard,
} from '../FeatureStrategyProdGuard/FeatureStrategyProdGuard.tsx';
import { formatFeaturePath } from '../FeatureStrategyEdit/FeatureStrategyEdit.tsx';
import { useChangeRequestInReviewWarning } from 'hooks/useChangeRequestInReviewWarning';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useHasProjectEnvironmentAccess } from 'hooks/useHasAccess';
import { FeatureStrategyTitle } from './FeatureStrategyTitle/FeatureStrategyTitle.tsx';
import { FeatureStrategyEnabledDisabled } from './FeatureStrategyEnabledDisabled/FeatureStrategyEnabledDisabled.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { formatStrategyName } from 'utils/strategyNames';
import { Badge } from 'component/common/Badge/Badge';
import { UpgradeChangeRequests } from '../../FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/UpgradeChangeRequests/UpgradeChangeRequests.tsx';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';

interface IFeatureStrategyFormProps {
    feature: IFeatureToggle;
    projectId: string;
    environmentId: string;
    permission: string;
    onSubmit: () => void;
    onCancel?: () => void;
    loading: boolean;
    isChangeRequest: boolean;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    errors: IFormErrors;
    tab: number;
    setTab: React.Dispatch<React.SetStateAction<number>>;
    StrategyVariants: JSX.Element;
    Limit?: JSX.Element;
    disabled?: boolean;
}

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

const StyledTitle = styled('h1')(({ theme }) => ({
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    minHeight: '60px',
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    position: 'relative',
    marginTop: theme.spacing(3.5),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    width: '100%',
}));

const StyledHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
}));

const StyledAlertBox = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    '& > *': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    width: '100px',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

const StyledConstraintSeparator = styled(ConstraintSeparator)({
    top: '-10px',
    left: '0',
    transform: 'translateY(0)',
});

export const FeatureStrategyForm = ({
    projectId,
    feature,
    environmentId,
    permission,
    onSubmit,
    onCancel,
    loading,
    strategy,
    setStrategy,
    segments,
    setSegments,
    errors,
    isChangeRequest,
    tab,
    setTab,
    StrategyVariants,
    Limit,
    disabled,
}: IFeatureStrategyFormProps) => {
    const { trackEvent } = usePlausibleTracker();
    const [showProdGuard, setShowProdGuard] = useState(false);
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const enableProdGuard = useFeatureStrategyProdGuard(feature, environmentId);
    const access = useHasProjectEnvironmentAccess(
        permission,
        projectId,
        environmentId,
    );
    const { strategyDefinition } = useStrategy(strategy?.name);

    useEffect(() => {
        trackEvent('new-strategy-form', {
            props: {
                eventType: 'seen',
            },
        });
    }, []);

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

    const foundEnvironment = feature.environments.find(
        (environment) => environment.name === environmentId,
    );

    const { data } = usePendingChangeRequests(feature.project);
    const { changeRequestInReviewOrApproved, alert } =
        useChangeRequestInReviewWarning(data);

    const hasChangeRequestInReviewForEnvironment =
        changeRequestInReviewOrApproved(environmentId || '');

    const changeRequestButtonText = hasChangeRequestInReviewForEnvironment
        ? 'Add to existing change request'
        : 'Add change to draft';

    const { isOss } = useUiConfig();
    const showChangeRequestUpgrade =
        foundEnvironment?.type === 'production' && isOss();

    const navigate = useNavigate();

    const { error: uiConfigError, loading: uiConfigLoading } = useUiConfig();

    if (uiConfigError) {
        throw uiConfigError;
    }

    if (uiConfigLoading || !strategyDefinition) {
        return null;
    }

    const findParameterDefinition = (name: string): IStrategyParameter => {
        return strategyDefinition.parameters.find((parameterDefinition) => {
            return parameterDefinition.name === name;
        })!;
    };

    const validateParameter = (
        name: string,
        value: IFeatureStrategyParameters[string],
    ): boolean => {
        const parameterValueError = validateParameterValue(
            findParameterDefinition(name),
            value,
        );
        if (parameterValueError) {
            errors.setFormError(name, parameterValueError);
            return false;
        } else {
            errors.removeFormError(name);
            return true;
        }
    };

    const validateAllParameters = (): boolean => {
        return strategyDefinition.parameters
            .map((parameter) => parameter.name)
            .map((name) => validateParameter(name, strategy.parameters?.[name]))
            .every(Boolean);
    };

    const onDefaultCancel = () => {
        navigate(formatFeaturePath(feature.project, feature.name));
    };

    const onSubmitWithValidation = async (event: React.FormEvent) => {
        if (Array.isArray(strategy.variants) && strategy.variants?.length > 0) {
            trackEvent('strategy-variants', {
                props: {
                    eventType: 'submitted',
                },
            });
        }
        event.preventDefault();
        if (!validateAllParameters()) {
            return;
        }

        trackEvent('new-strategy-form', {
            props: {
                eventType: 'submitted',
            },
        });

        if (enableProdGuard && !isChangeRequest) {
            setShowProdGuard(true);
        } else {
            onSubmit();
        }
    };

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTab(newValue);
    };

    const getTargetingCount = () => {
        const constraintCount = strategy.constraints?.length || 0;
        const segmentCount = segments.length || 0;

        return constraintCount + segmentCount;
    };

    const showVariants = Boolean(
        strategy.parameters && 'stickiness' in strategy.parameters,
    );

    return (
        <>
            <StyledHeaderBox>
                <StyledTitle>
                    {formatStrategyName(strategy.name || '')}
                </StyledTitle>
            </StyledHeaderBox>

            <StyledAlertBox>
                <ConditionallyRender
                    condition={hasChangeRequestInReviewForEnvironment}
                    show={alert}
                    elseShow={
                        <ConditionallyRender
                            condition={isChangeRequest}
                            show={
                                <FeatureStrategyChangeRequestAlert
                                    environment={environmentId}
                                />
                            }
                        />
                    }
                />
            </StyledAlertBox>

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
            <StyledForm onSubmit={onSubmitWithValidation}>
                <ConditionallyRender
                    condition={tab === 0}
                    show={
                        <>
                            <FeatureStrategyTitle
                                title={strategy.title || ''}
                                setTitle={(title) => {
                                    setStrategy((prev) => ({
                                        ...prev,
                                        title,
                                    }));
                                }}
                            />

                            <FeatureStrategyType
                                strategy={strategy}
                                strategyDefinition={strategyDefinition}
                                setStrategy={setStrategy}
                                validateParameter={validateParameter}
                                errors={errors}
                                hasAccess={access}
                            />
                            <FeatureStrategyEnabledDisabled
                                enabled={!strategy?.disabled}
                                onToggleEnabled={() =>
                                    setStrategy((strategyState) => ({
                                        ...strategyState,
                                        disabled: !strategyState.disabled,
                                    }))
                                }
                            />

                            <ConditionallyRender
                                condition={!isChangeRequest}
                                show={
                                    <FeatureStrategyEnabled
                                        projectId={feature.project}
                                        featureId={feature.name}
                                        environmentId={environmentId}
                                    />
                                }
                            />
                        </>
                    }
                />

                <ConditionallyRender
                    condition={tab === 1}
                    show={
                        <>
                            <Alert severity='info' sx={{ mb: 2 }} icon={false}>
                                Segmentation and constraints allow you to set
                                filters on your strategies, so that they will
                                only be evaluated for users and applications
                                that match the specified preconditions.
                            </Alert>
                            <FeatureStrategySegment
                                segments={segments}
                                setSegments={setSegments}
                                projectId={projectId}
                            />

                            <StyledBox>
                                <StyledDivider />
                                <StyledConstraintSeparator />
                            </StyledBox>
                            <FeatureStrategyConstraints
                                projectId={feature.project}
                                environmentId={environmentId}
                                strategy={strategy}
                                setStrategy={setStrategy}
                            />
                        </>
                    }
                />

                <ConditionallyRender
                    condition={tab === 2}
                    show={
                        <ConditionallyRender
                            condition={showVariants}
                            show={StrategyVariants}
                        />
                    }
                />

                <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    {Limit}
                </Box>

                {showChangeRequestUpgrade ? <UpgradeChangeRequests /> : null}

                <StyledButtons>
                    <PermissionButton
                        permission={permission}
                        projectId={feature.project}
                        environmentId={environmentId}
                        variant='contained'
                        color='primary'
                        type='submit'
                        disabled={
                            disabled ||
                            loading ||
                            !hasValidConstraints ||
                            errors.hasFormErrors()
                        }
                        data-testid={STRATEGY_FORM_SUBMIT_ID}
                    >
                        {isChangeRequest
                            ? changeRequestButtonText
                            : 'Save strategy'}
                    </PermissionButton>
                    <Button
                        type='button'
                        color='primary'
                        onClick={onCancel ? onCancel : onDefaultCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <FeatureStrategyProdGuard
                        open={showProdGuard}
                        onClose={() => setShowProdGuard(false)}
                        onClick={onSubmit}
                        loading={loading}
                        label='Save strategy'
                    />
                </StyledButtons>
            </StyledForm>
        </>
    );
};
