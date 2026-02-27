import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, styled, Box } from '@mui/material';
import type {
    IFeatureStrategy,
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';
import { FeatureStrategyEnabled } from './FeatureStrategyEnabled/FeatureStrategyEnabled.tsx';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { STRATEGY_FORM_SUBMIT_ID } from 'utils/testIds';
import { useConstraintsValidation } from 'hooks/api/getters/useConstraintsValidation/useConstraintsValidation';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
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
import { FeatureStrategyEnabledDisabled } from './FeatureStrategyEnabledDisabled/FeatureStrategyEnabledDisabled.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { UpgradeChangeRequests } from '../../FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/UpgradeChangeRequests/UpgradeChangeRequests.tsx';

import { StrategyFormBody } from './StrategyFormBody.tsx';

export interface IFeatureStrategyFormProps {
    feature: IFeatureToggle;
    environmentId: string;
    permission: string;
    onSubmit: () => void;
    onCancel?: () => void;
    loading: boolean;
    areChangeRequestsEnabled: boolean;
    strategy: Partial<IFeatureStrategy>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
    errors: IFormErrors;
    canRenamePreexistingVariants?: boolean;
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

const StyledAlertBox = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    '& > *': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

export const FeatureStrategyForm = ({
    feature,
    environmentId,
    permission,
    onSubmit,
    onCancel,
    loading,
    strategy,
    setStrategy,
    errors,
    areChangeRequestsEnabled,
    canRenamePreexistingVariants,
    Limit,
    disabled,
}: IFeatureStrategyFormProps) => {
    const { trackEvent } = usePlausibleTracker();
    const [showProdGuard, setShowProdGuard] = useState(false);
    const hasValidConstraints = useConstraintsValidation(strategy.constraints);
    const enableProdGuard = useFeatureStrategyProdGuard(feature, environmentId);
    const { strategyDefinition } = useStrategy(strategy?.name);

    useEffect(() => {
        trackEvent('new-strategy-form', {
            props: {
                eventType: 'seen',
            },
        });
    }, []);

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

        if (enableProdGuard && !areChangeRequestsEnabled) {
            setShowProdGuard(true);
        } else {
            onSubmit();
        }
    };

    return (
        <StrategyFormBody
            strategy={strategy}
            setStrategy={setStrategy}
            errors={errors}
            validateParameter={validateParameter}
            canRenamePreexistingVariants={canRenamePreexistingVariants}
            alertContent={
                <StyledAlertBox>
                    <ConditionallyRender
                        condition={hasChangeRequestInReviewForEnvironment}
                        show={alert}
                        elseShow={
                            <ConditionallyRender
                                condition={areChangeRequestsEnabled}
                                show={
                                    <FeatureStrategyChangeRequestAlert
                                        environment={environmentId}
                                    />
                                }
                            />
                        }
                    />
                </StyledAlertBox>
            }
            generalTabExtras={
                <>
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
                        condition={!areChangeRequestsEnabled}
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
            renderContentWrapper={(tabContent) => (
                <StyledForm onSubmit={onSubmitWithValidation}>
                    {tabContent}

                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'flex-end',
                        }}
                    >
                        {Limit}
                    </Box>

                    {showChangeRequestUpgrade ? (
                        <UpgradeChangeRequests />
                    ) : null}

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
                            {areChangeRequestsEnabled
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
            )}
        />
    );
};
