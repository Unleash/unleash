import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import {
    CREATE_API_TOKEN,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { CREATE_API_TOKEN_BUTTON } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';

interface ICreateApiTokenButton {
    path: string;
    permission: string;
    project?: string;
}

export const CreateApiTokenButton = ({
    path,
    permission,
    project,
}: ICreateApiTokenButton) => {
    const navigate = useNavigate();

    return (
        <ResponsiveButton
            Icon={Add}
            onClick={() => navigate(path)}
            data-testid={CREATE_API_TOKEN_BUTTON}
            permission={permission}
            projectId={project}
            maxWidth="700px"
        >
            New API token
        </ResponsiveButton>
    );
};
