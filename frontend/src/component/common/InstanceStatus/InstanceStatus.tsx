import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import React, { FC } from 'react';
import { InstanceStatusBar } from 'component/common/InstanceStatus/InstanceStatusBar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const InstanceStatus: FC = ({ children }) => {
    const { instanceStatus } = useInstanceStatus();

    return (
        <div hidden={!instanceStatus} style={{ height: '100%' }}>
            <ConditionallyRender
                condition={Boolean(instanceStatus)}
                show={() => (
                    <InstanceStatusBarMemo instanceStatus={instanceStatus!} />
                )}
            />
            {children}
        </div>
    );
};

const InstanceStatusBarMemo = React.memo(InstanceStatusBar);
