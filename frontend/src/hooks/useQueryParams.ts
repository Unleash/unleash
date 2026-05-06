import { useLocation } from 'react-router-dom';

const useQueryParams = () => {
    return new URLSearchParams(useLocation().search);
};

export default useQueryParams;
