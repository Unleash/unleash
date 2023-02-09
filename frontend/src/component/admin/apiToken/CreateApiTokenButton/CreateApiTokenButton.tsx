import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import {
    CREATE_API_TOKEN,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { CREATE_API_TOKEN_BUTTON } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';

export const CreateApiTokenButton = () => {
    const navigate = useNavigate();

    const project = useOptionalPathParam('projectId');

    const to = Boolean(project) ? 'create' : '/admin/api/create-token';
    const permission = Boolean(project)
        ? CREATE_API_TOKEN
        : CREATE_PROJECT_API_TOKEN;

    return (
        <ResponsiveButton
            Icon={Add}
            onClick={() => navigate(to)}
            data-testid={CREATE_API_TOKEN_BUTTON}
            permission={permission}
            maxWidth="700px"
        >
            New API token
        </ResponsiveButton>
    );
};
