import React, { useContext } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { EventLog } from 'component/events/EventLog/EventLog';

export const EventPage = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <ConditionallyRender
            condition={hasAccess(ADMIN)}
            show={() => <EventLog title="Event log" />}
            elseShow={<AdminAlert />}
        />
    );
};
