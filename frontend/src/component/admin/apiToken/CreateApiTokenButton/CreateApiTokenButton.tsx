import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { CREATE_API_TOKEN_BUTTON } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';

export const CreateApiTokenButton = () => {
    const navigate = useNavigate();

    return (
        <ResponsiveButton
            Icon={Add}
            onClick={() => navigate('/admin/api/create-token')}
            data-testid={CREATE_API_TOKEN_BUTTON}
            permission={CREATE_API_TOKEN}
            maxWidth="700px"
        >
            New API token
        </ResponsiveButton>
    );
};
