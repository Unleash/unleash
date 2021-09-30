import { Alert } from '@material-ui/lab';
import React from 'react';
import Dialogue from '../../../common/Dialogue';
import Input from '../../../common/Input/Input';
import { ProjectEnvironment } from '../ProjectEnvironment';
import { useStyles } from './EnvironmentDisableConfirm.styles';

interface IEnvironmentDisableConfirmProps {
    env?: ProjectEnvironment;
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
    const styles = useStyles();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    return (
        <Dialogue
            title="Are you sure you want to disable this environment?"
            open={open}
            primaryButtonText="Disable environment"
            secondaryButtonText="Cancel"
            onClick={() => handleDisableEnvironment()}
            disabledPrimaryButton={env?.name !== confirmName}
            onClose={handleCancelDisableEnvironment}
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

            <Input
                onChange={handleChange}
                value={confirmName}
                label="Environment name"
                className={styles.environmentDeleteInput}
            />
        </Dialogue>
    );
};

export default EnvironmentDisableConfirm;
