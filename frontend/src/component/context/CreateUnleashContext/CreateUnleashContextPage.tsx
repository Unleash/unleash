import { useNavigate } from 'react-router';
import { CreateUnleashContext } from 'component/context/CreateUnleashContext/CreateUnleashContext';
import { GO_BACK } from 'constants/navigate';

export const CreateUnleashContextPage = () => {
    const navigate = useNavigate();

    return (
        <CreateUnleashContext
            onSubmit={() => navigate('/context')}
            onCancel={() => navigate(GO_BACK)}
        />
    );
};
