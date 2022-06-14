import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import React, { FC, VFC, useEffect, useState, useContext } from 'react';
import { InstanceStatusBar } from 'component/common/InstanceStatus/InstanceStatusBar';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IInstanceStatus, InstanceState } from 'interfaces/instance';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';
import useInstanceStatusApi from 'hooks/api/actions/useInstanceStatusApi/useInstanceStatusApi';
import { hasTrialExpired } from 'utils/instanceTrial';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

interface ITrialDialogProps {
    instanceStatus: IInstanceStatus;
    onExtendTrial: () => Promise<void>;
}

const TrialDialog: VFC<ITrialDialogProps> = ({
    instanceStatus,
    onExtendTrial,
}) => {
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();
    const trialHasExpired = hasTrialExpired(instanceStatus);
    const [dialogOpen, setDialogOpen] = useState(trialHasExpired);

    useEffect(() => {
        setDialogOpen(trialHasExpired);
        const interval = setInterval(() => {
            setDialogOpen(trialHasExpired);
        }, 60000);
        return () => clearInterval(interval);
    }, [trialHasExpired]);

    if (hasAccess(ADMIN)) {
        return (
            <Dialogue
                open={dialogOpen}
                primaryButtonText="Upgrade trial"
                secondaryButtonText={
                    instanceStatus?.trialExtended
                        ? 'Remind me later'
                        : 'Extend trial (5 days)'
                }
                onClick={() => {
                    navigate('/admin/billing');
                    setDialogOpen(false);
                }}
                onClose={(_: any, reason?: string) => {
                    if (
                        reason !== 'backdropClick' &&
                        reason !== 'escapeKeyDown'
                    ) {
                        onExtendTrial();
                        setDialogOpen(false);
                    }
                }}
                title={`Your free ${instanceStatus.plan} trial has expired!`}
            >
                <Typography>
                    <strong>Upgrade trial</strong> otherwise your{' '}
                    <strong>account will be deleted.</strong>
                </Typography>
            </Dialogue>
        );
    }

    return (
        <Dialogue
            open={dialogOpen}
            secondaryButtonText="Remind me later"
            onClose={() => {
                setDialogOpen(false);
            }}
            title={`Your free ${instanceStatus.plan} trial has expired!`}
        >
            <Typography>
                Please inform your admin to <strong>Upgrade trial</strong> or
                your <strong>account will be deleted.</strong>
            </Typography>
        </Dialogue>
    );
};

export const InstanceStatus: FC = ({ children }) => {
    const { instanceStatus, refetchInstanceStatus, isBilling } =
        useInstanceStatus();
    const { extendTrial } = useInstanceStatusApi();
    const { setToastApiError } = useToast();

    const onExtendTrial = async () => {
        if (
            instanceStatus?.state === InstanceState.TRIAL &&
            !instanceStatus?.trialExtended
        ) {
            try {
                await extendTrial();
                await refetchInstanceStatus();
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    return (
        <div style={{ height: '100%' }}>
            <ConditionallyRender
                condition={isBilling && Boolean(instanceStatus)}
                show={() => (
                    <>
                        <InstanceStatusBarMemo
                            instanceStatus={instanceStatus!}
                        />
                        <TrialDialog
                            instanceStatus={instanceStatus!}
                            onExtendTrial={onExtendTrial}
                        />
                    </>
                )}
            />
            {children}
        </div>
    );
};

const InstanceStatusBarMemo = React.memo(InstanceStatusBar);
