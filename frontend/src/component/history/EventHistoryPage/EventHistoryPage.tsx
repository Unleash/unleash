import { Alert } from '@material-ui/lab';
import React, { useContext } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import ConditionallyRender from 'component/common/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { EventHistory } from '../EventHistory/EventHistory';

export const EventHistoryPage = () => {
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
