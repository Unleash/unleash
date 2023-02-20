import { GO_BACK } from 'constants/navigate';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { useNavigate } from 'react-router-dom';
import { CreateProjectApiTokenForm } from './CreateProjectApiTokenForm';

export const CreateProjectApiToken = () => {
    const navigate = useNavigate();

    return (
        <SidebarModal
            open
            onClose={() => navigate(GO_BACK)}
            label={`Create API token`}
        >
            <CreateProjectApiTokenForm />
        </SidebarModal>
    );
};
