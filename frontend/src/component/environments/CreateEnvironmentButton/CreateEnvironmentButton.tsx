import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { Add } from '@mui/icons-material';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useNavigate } from 'react-router-dom';

export const CreateEnvironmentButton = () => {
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();

    return (
        <ResponsiveButton
            onClick={() => navigate('/environments/create')}
            maxWidth="700px"
            Icon={Add}
            permission={ADMIN}
            disabled={!Boolean(uiConfig.flags.EEA)}
        >
            New environment
        </ResponsiveButton>
    );
};
