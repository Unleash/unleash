import { Navigate } from 'react-router-dom';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import InvoiceAdminPage from 'component/admin/invoice/InvoiceAdminPage';

const FlaggedBillingRedirect = () => {
    const { uiConfig, loading } = useUiConfig();

    if (loading) {
        return null;
    }

    if (!uiConfig.flags.UNLEASH_CLOUD) {
        return <InvoiceAdminPage />;
    }

    return <Navigate to="/admin/billing" replace />;
};

export default FlaggedBillingRedirect;
