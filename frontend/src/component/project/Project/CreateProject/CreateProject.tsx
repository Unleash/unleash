import { Navigate } from 'react-router';

const CreateProject = () => {
    return <Navigate to={`/projects?create=true`} replace />;
};

export default CreateProject;
