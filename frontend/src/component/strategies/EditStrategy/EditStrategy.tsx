import { useHistory, useParams } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useStrategyForm } from '../hooks/useStrategyForm';
import { StrategyForm } from '../StrategyForm/StrategyForm';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import useStrategiesApi from 'hooks/api/actions/useStrategiesApi/useStrategiesApi';
import useStrategies from 'hooks/api/getters/useStrategies/useStrategies';
import { formatUnknownError } from 'utils/format-unknown-error';
import useStrategy from 'hooks/api/getters/useStrategy/useStrategy';

export const EditStrategy = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const history = useHistory();
    const { name } = useParams<{ name: string }>();
    const { strategy } = useStrategy(name);
    const {
        strategyName,
        strategyDesc,
        params,
        setParams,
        setStrategyName,
        setStrategyDesc,
        getStrategyPayload,
        validateParams,
        clearErrors,
        setErrors,
        errors,
    } = useStrategyForm(
        strategy?.name,
        strategy?.description,
        strategy?.parameters
    );
    const { updateStrategy, loading } = useStrategiesApi();
    const { refetchStrategies } = useStrategies();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        clearErrors();
        e.preventDefault();
        if (validateParams()) {
            const payload = getStrategyPayload();
            try {
                await updateStrategy(payload);
                history.push(`/strategies/${strategyName}`);
                setToastData({
                    type: 'success',
                    title: 'Success',
                    text: 'Successfully updated strategy',
                });
                refetchStrategies();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/strategies/${name}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getStrategyPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit strategy type"
            description="The strategy type and the parameters will be selectable when adding an activation strategy to a toggle in the environments. 
            The parameter defines the type of activation strategy. E.g. you can create a type 'Teams' and add a parameter 'List'. Then it's easy to add team names to the activation strategy"
            documentationLink="https://docs.getunleash.io/advanced/custom_activation_strategy"
            formatApiCode={formatApiCode}
        >
            <StrategyForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                strategyName={strategyName}
                setStrategyName={setStrategyName}
                strategyDesc={strategyDesc}
                setStrategyDesc={setStrategyDesc}
                params={params}
                setParams={setParams}
                mode="Edit"
                setErrors={setErrors}
                clearErrors={clearErrors}
            >
                <PermissionButton permission={CREATE_STRATEGY} type="submit">
                    Save
                </PermissionButton>
            </StrategyForm>
        </FormTemplate>
    );
};
