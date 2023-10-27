import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';

export const AddonRedirect = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        navigate(`/integrations${location.pathname.replace('/addons', '')}`);
    }, [location.pathname, navigate]);

    return (
        <PageContent>
            Addons where renamed to{' '}
            <Link to='/integrations'>/integrations</Link>
        </PageContent>
    );
};
