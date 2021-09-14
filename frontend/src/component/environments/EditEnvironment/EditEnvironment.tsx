import { CloudCircle } from '@material-ui/icons';
import { useEffect, useState } from 'react';
import EnvironmentTypeSelector from '../form/EnvironmentTypeSelector/EnvironmentTypeSelector';
import { useStyles } from './EditEnvironment.styles';
import { IEnvironment } from '../../../interfaces/environments';
import Input from '../../common/Input/Input';
import useEnvironmentApi from '../../../hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import useLoading from '../../../hooks/useLoading';
import useEnvironments from '../../../hooks/api/getters/useEnvironments/useEnvironments';
import Dialogue from '../../common/Dialogue';

interface IEditEnvironmentProps {
    env: IEnvironment;
    setEditEnvironment: React.Dispatch<React.SetStateAction<boolean>>;
    editEnvironment: boolean;
    setToastData: React.Dispatch<React.SetStateAction<any>>;
}

const EditEnvironment = ({
    env,
    setEditEnvironment,
    editEnvironment,
    setToastData,
}: IEditEnvironmentProps) => {
    const styles = useStyles();
    const [type, setType] = useState(env.type);
    const [envDisplayName, setEnvDisplayName] = useState(env.displayName);
    const { updateEnvironment, loading } = useEnvironmentApi();
    const { refetch } = useEnvironments();
    const ref = useLoading(loading);

    useEffect(() => {
        setType(env.type);
        setEnvDisplayName(env.displayName);
    }, [env.type, env.displayName]);

    const handleTypeChange = (event: React.FormEvent<HTMLInputElement>) => {
        setType(event.currentTarget.value);
    };

    const handleEnvDisplayName = (e: React.FormEvent<HTMLInputElement>) =>
        setEnvDisplayName(e.currentTarget.value);

    const isDisabled = () => {
        if (type === env.type && envDisplayName === env.displayName) {
            return true;
        }
        return false;
    };

    const handleCancel = () => {
        setEditEnvironment(false);
        resetFields();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedEnv = {
            sortOrder: env.sortOrder,
            displayName: envDisplayName,
            type,
        };

        try {
            await updateEnvironment(env.name, updatedEnv);
            setToastData({
                type: 'success',
                show: true,
                text: 'Successfully updated environment.',
            });
            resetFields();
            refetch();
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        } finally {
            setEditEnvironment(false);
        }
    };

    const resetFields = () => {
        setType(env.type);
        setEnvDisplayName(env.displayName);
    };

    return (
        <Dialogue
            open={editEnvironment}
            title="Edit environment"
            onClose={handleCancel}
            onClick={handleSubmit}
            primaryButtonText="Save"
            secondaryButtonText="Cancel"
            disabledPrimaryButton={isDisabled()}
        >
            <div className={styles.body} ref={ref}>
                <h3 className={styles.formHeader} data-loading>
                    Environment Id
                </h3>
                <h3 className={styles.subheader} data-loading>
                    <CloudCircle className={styles.icon} /> {env.name}
                </h3>
                <form>
                    <EnvironmentTypeSelector
                        onChange={handleTypeChange}
                        value={type}
                    />

                    <h3 className={styles.formHeader} data-loading>
                        Environment display name
                    </h3>

                    <Input
                        label="Display name"
                        placeholder="Optional name to be displayed in the admin panel"
                        className={styles.inputField}
                        value={envDisplayName}
                        onChange={handleEnvDisplayName}
                        data-loading
                    />
                </form>
            </div>
        </Dialogue>
    );
};

export default EditEnvironment;
