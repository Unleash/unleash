import { Alert } from '@mui/material';
import React from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { useStyles } from './EnvironmentDisableConfirm.styles';
import { IProjectEnvironment } from 'interfaces/environments';

interface IEnvironmentDisableConfirmProps {
    env?: IProjectEnvironment;
    open: boolean;
    handleDisableEnvironment: () => Promise<void>;
    handleCancelDisableEnvironment: () => void;
    confirmName: string;
    setConfirmName: React.Dispatch<React.SetStateAction<string>>;
}

const EnvironmentDisableConfirm = ({
    env,
    open,
    handleDisableEnvironment,
    handleCancelDisableEnvironment,
    confirmName,
    setConfirmName,
}: IEnvironmentDisableConfirmProps) => {
    const { classes: styles } = useStyles();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    const formId = 'disable-environment-confirmation-form';

    return (
        <Dialogue
            title="Are you sure you want to disable this environment?"
            open={open}
            primaryButtonText="Disable environment"
            secondaryButtonText="Cancel"
            onClick={() => handleDisableEnvironment()}
            disabledPrimaryButton={env?.name !== confirmName}
            onClose={handleCancelDisableEnvironment}
            formId={formId}
        >
            <Alert severity="error">
                Danger. Disabling an environment can impact client applications
                connected to the environment and result in feature toggles being
                disabled.
            </Alert>

            <p className={styles.deleteParagraph}>
                In order to disable this environment, please enter the id of the
                environment in the textfield below: <strong>{env?.name}</strong>
            </p>

            <form id={formId}>
                <Input
                    autoFocus
                    onChange={handleChange}
                    value={confirmName}
                    label="Environment name"
                    className={styles.environmentDeleteInput}
                />
            </form>
        </Dialogue>
    );
};

export default EnvironmentDisableConfirm;
