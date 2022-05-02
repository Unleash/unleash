import React, { useContext } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { EventHistory } from '../EventHistory/EventHistory';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';

export const EventHistoryPage = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <ConditionallyRender
            condition={hasAccess(ADMIN)}
            show={<EventHistory />}
            elseShow={<AdminAlert />}
        />
    );
};
