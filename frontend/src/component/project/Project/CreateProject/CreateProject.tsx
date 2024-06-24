import { Navigate } from 'react-router-dom';

const CreateProject = () => {
    return <Navigate to={`/projects?create=true`} replace />;
};

export default CreateProject;
