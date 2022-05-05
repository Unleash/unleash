import { useNavigate } from 'react-router-dom';
import { CreateUnleashContext } from 'component/context/CreateUnleashContext/CreateUnleashContext';

export const CreateUnleashContextPage = () => {
    const navigate = useNavigate();

    return (
        <CreateUnleashContext
            onSubmit={() => navigate('/context')}
            onCancel={() => navigate(-1)}
        />
    );
};
