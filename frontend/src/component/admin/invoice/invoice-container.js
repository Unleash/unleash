import { connect } from 'react-redux';

import Component from './invoice-list';
import { fetchInvoices } from '../../../store/e-admin-invoice/actions';
export default connect(
    state => ({
        location: state.settings.toJS().location || {},
        invoices: state.invoiceAdmin.toJS(),
    }),
    { fetchInvoices }
)(Component);
