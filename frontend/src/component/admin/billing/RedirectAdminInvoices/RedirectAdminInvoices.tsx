import { Navigate } from 'react-router-dom';

const RedirectAdminInvoices = () => {
    return <Navigate to="/admin/billing" replace />;
};

export default RedirectAdminInvoices;
