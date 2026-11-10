import { useLocation } from 'react-router';

const useQueryParams = () => {
    return new URLSearchParams(useLocation().search);
};

export default useQueryParams;
