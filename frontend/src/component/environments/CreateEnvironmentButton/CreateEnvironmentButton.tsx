import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import Add from '@mui/icons-material/Add';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';

export const CreateEnvironmentButton = () => {
    const { uiConfig } = useUiConfig();
    const { environments } = useEnvironments();
    const environmentLimit = uiConfig.resourceLimits.environments;
    const navigate = useNavigate();

    const atEnvironmentLimit = environments.length >= environmentLimit;

    return (
        <ResponsiveButton
            tooltipProps={{
                arrow: true,
                title: atEnvironmentLimit
                    ? `You have reached the limit of environments you can create (${environmentLimit}).`
                    : undefined,
            }}
            onClick={() => navigate('/environments/create')}
            maxWidth='700px'
            Icon={Add}
            permission={ADMIN}
            disabled={atEnvironmentLimit || !uiConfig.flags.EEA}
        >
            New environment
        </ResponsiveButton>
    );
};
