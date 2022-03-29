import { useHistory } from 'react-router-dom';
import { CreateUnleashContext } from 'component/context/CreateUnleashContext/CreateUnleashContext';

export const CreateUnleashContextPage = () => {
    const { push, goBack } = useHistory();
    return (
        <CreateUnleashContext
            onSubmit={() => push('/context')}
            onCancel={() => goBack()}
        />
    );
};
