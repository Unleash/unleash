import { Alert } from '@material-ui/lab';
import React from 'react';
import { IEnvironment } from '../../../../interfaces/environments';
import Dialogue from '../../../common/Dialogue';
import Input from '../../../common/Input/Input';
import EnvironmentCard from '../EnvironmentCard/EnvironmentCard';
import { useStyles } from './EnvironmentDeleteConfirm.styles';

interface IEnviromentDeleteConfirmProps {
    env: IEnvironment;
    open: boolean;
    setSelectedEnv: React.Dispatch<React.SetStateAction<IEnvironment>>;
    setDeldialogue: React.Dispatch<React.SetStateAction<boolean>>;
    handleDeleteEnvironment: (name: string) => Promise<void>;
    confirmName: string;
    setConfirmName: React.Dispatch<React.SetStateAction<string>>;
}

const EnvironmentDeleteConfirm = ({
    env,
    open,
    setDeldialogue,
    handleDeleteEnvironment,
    confirmName,
    setConfirmName,
}: IEnviromentDeleteConfirmProps) => {
    const styles = useStyles();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    const handleCancel = () => {
        setDeldialogue(false);
        setConfirmName('');
    };

    const formId = 'delete-environment-confirmation-form';

    return (
        <Dialogue
            title="Are you sure you want to delete this environment?"
            open={open}
            primaryButtonText="Delete environment"
            secondaryButtonText="Cancel"
            onClick={handleDeleteEnvironment}
            disabledPrimaryButton={env?.name !== confirmName}
            onClose={handleCancel}
            formId={formId}
        >
            <Alert severity="error">
                Danger. Deleting this environment will result in removing all
                strategies that are active in this environment across all
                feature toggles.
            </Alert>
            <EnvironmentCard name={env?.name} type={env?.type} />

            <p className={styles.deleteParagraph}>
                In order to delete this environment, please enter the id of the
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

export default EnvironmentDeleteConfirm;
