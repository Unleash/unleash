import { useNavigate, Link } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useStrategyForm } from '../hooks/useStrategyForm.ts';
import { StrategyForm } from '../StrategyForm/StrategyForm.tsx';
import { CREATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import useStrategiesApi from 'hooks/api/actions/useStrategiesApi/useStrategiesApi';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { formatUnknownError } from 'utils/formatUnknownError';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { GO_BACK } from 'constants/navigate';
import { CustomStrategyInfo } from '../CustomStrategyInfo/CustomStrategyInfo.tsx';
import { Alert } from '@mui/material';

const CreateStrategyDeprecationWarning = () => (
    <Alert
        severity='warning'
        sx={(theme) => ({
            marginBottom: theme.spacing(3),
        })}
    >
        Custom strategies are deprecated and may be removed in a future major
        release. We recommend using the predefined strategies like Gradual
        rollout with{' '}
        <Link to='https://docs.getunleash.io/reference/activation-strategies#constraints'>
            {' '}
            constraints
        </Link>{' '}
        instead of creating a custom strategy.
    </Alert>
);

export const CreateStrategy = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const {
        strategyName,
        strategyDesc,
        params,
        setParams,
        setStrategyName,
        setStrategyDesc,
        getStrategyPayload,
        validateStrategyName,
        validateParams,
        clearErrors,
        setErrors,
        errors,
    } = useStrategyForm();
    const { createStrategy, loading } = useStrategiesApi();
    const { refetchStrategies } = useStrategies();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        clearErrors();
        e.preventDefault();
        const validName = validateStrategyName();

        if (validName && validateParams()) {
            const payload = getStrategyPayload();
            try {
                await createStrategy(payload);
                refetchStrategies();
                navigate(`/strategies/${strategyName}`);
                setToastData({
                    text: 'Strategy created',
                    type: 'success',
                });
            } catch (e: unknown) {
                setToastApiError(formatUnknownError(e));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/strategies' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getStrategyPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title='Create strategy type'
            description="The strategy type and the parameters will be selectable when adding an activation strategy to a toggle in the environments.
            The parameter defines the type of activation strategy. E.g. you can create a type 'Teams' and add a parameter 'List'. Then it's easy to add team names to the activation strategy"
            documentationLink='https://docs.getunleash.io/reference/custom-activation-strategies'
            documentationLinkLabel='Custom strategies documentation'
            formatApiCode={formatApiCode}
        >
            <CreateStrategyDeprecationWarning />
            <CustomStrategyInfo alert />
            <StrategyForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                strategyName={strategyName}
                setStrategyName={setStrategyName}
                validateStrategyName={validateStrategyName}
                strategyDesc={strategyDesc}
                setStrategyDesc={setStrategyDesc}
                params={params}
                setParams={setParams}
                mode='Create'
                setErrors={setErrors}
                clearErrors={clearErrors}
            >
                <CreateButton name='strategy' permission={CREATE_STRATEGY}>
                    Create strategy
                </CreateButton>
            </StrategyForm>
        </FormTemplate>
    );
};
