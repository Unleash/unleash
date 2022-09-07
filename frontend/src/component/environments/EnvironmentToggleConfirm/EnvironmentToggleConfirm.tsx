import { capitalize } from '@mui/material';
import { Alert } from '@mui/material';
import React from 'react';
import { IEnvironment } from 'interfaces/environments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import EnvironmentCard from 'component/environments/EnvironmentCard/EnvironmentCard';

interface IEnvironmentToggleConfirmProps {
    env: IEnvironment;
    open: boolean;
    setToggleDialog: React.Dispatch<React.SetStateAction<boolean>>;
    handleConfirmToggleEnvironment: () => void;
}

const EnvironmentToggleConfirm = ({
    env,
    open,
    setToggleDialog,
    handleConfirmToggleEnvironment,
}: IEnvironmentToggleConfirmProps) => {
    let text = env.enabled ? 'disable' : 'enable';

    const handleCancel = () => {
        setToggleDialog(false);
    };

    return (
        <Dialogue
            title={`Are you sure you want to ${text} this environment?`}
            open={open}
            primaryButtonText={capitalize(text)}
            secondaryButtonText="Cancel"
            onClick={handleConfirmToggleEnvironment}
            onClose={handleCancel}
        >
            <ConditionallyRender
                condition={env.enabled}
                show={
                    <Alert severity="info">
                        Disabling an environment will not effect any strategies
                        that already exist in that environment, but it will make
                        it unavailable as a selection option for new activation
                        strategies.
                    </Alert>
                }
                elseShow={
                    <Alert severity="info">
                        Enabling an environment will allow you to add new
                        activation strategies to this environment.
                    </Alert>
                }
            />

            <EnvironmentCard name={env?.name} type={env?.type} />
        </Dialogue>
    );
};

export default EnvironmentToggleConfirm;
