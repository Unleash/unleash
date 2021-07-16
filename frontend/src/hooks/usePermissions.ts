import { useContext } from 'react';
import AccessContext from '../contexts/AccessContext';

const usePermissions = () => {
    return useContext(AccessContext);
};

export default usePermissions;
