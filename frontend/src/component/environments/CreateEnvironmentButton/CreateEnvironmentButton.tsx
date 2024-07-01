import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import Add from '@mui/icons-material/Add';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';

export const CreateEnvironmentButton: React.FC<{
    numberOfEnvironments: number;
}> = ({ numberOfEnvironments }) => {
    const { uiConfig } = useUiConfig();
    const environmentLimit = uiConfig.resourceLimits.environments;
    const navigate = useNavigate();

    const disabled = numberOfEnvironments >= environmentLimit;

    return (
        <ResponsiveButton
            tooltipProps={{
                arrow: true,
                title: disabled
                    ? `You have reached the limit of environments you can create (${environmentLimit}).`
                    : undefined,
            }}
            onClick={() => navigate('/environments/create')}
            maxWidth='700px'
            Icon={Add}
            permission={ADMIN}
            disabled={disabled || !uiConfig.flags.EEA}
        >
            New environment {disabled ? '(disabled)' : '(not disabled)'} (limit:{' '}
            {environmentLimit}, count: {numberOfEnvironments})
        </ResponsiveButton>
    );
};
