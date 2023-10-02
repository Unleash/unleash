import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_API_TOKEN_BUTTON } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
interface ICreateApiTokenButton {
    path: string;
    permission: string | string[];
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
