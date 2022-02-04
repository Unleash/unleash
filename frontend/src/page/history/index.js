import { Alert } from '@material-ui/lab';
import React, { useContext } from 'react';
import { ADMIN } from '../../component/providers/AccessProvider/permissions';
import ConditionallyRender from '../../component/common/ConditionallyRender';
import { EventHistory } from '../../component/history/EventHistory/EventHistory';
import AccessContext from '../../contexts/AccessContext';

const HistoryPage = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <ConditionallyRender
            condition={hasAccess(ADMIN)}
            show={<EventHistory />}
            elseShow={
                <Alert severity="error">
                    You need instance admin to access this section.
                </Alert>
            }
        />
    );
};

export default HistoryPage;
