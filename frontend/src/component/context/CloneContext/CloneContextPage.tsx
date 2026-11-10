import { useNavigate } from 'react-router';
import { CloneContext } from 'component/context/CloneContext/CloneContext';
import { GO_BACK } from 'constants/navigate';

export const CloneContextPage = () => {
    const navigate = useNavigate();

    return (
        <CloneContext
            onSubmit={() => navigate('/context')}
            onCancel={() => navigate(GO_BACK)}
        />
    );
};
