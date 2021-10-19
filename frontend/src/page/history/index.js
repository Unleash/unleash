import { Alert } from '@material-ui/lab';
import React, { useContext } from 'react';
import { ADMIN } from '../../component/providers/AccessProvider/permissions';
import ConditionallyRender from '../../component/common/ConditionallyRender';
import HistoryComponent from '../../component/history/EventHistory';
import AccessContext from '../../contexts/AccessContext';

const HistoryPage = ({ history }) => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <ConditionallyRender
            condition={hasAccess(ADMIN)}
            show={<HistoryComponent />}
            elseShow={
                <Alert severity="error">
                    You need instance admin to access this section.
                </Alert>
            }
        />
    );
};

export default HistoryPage;
