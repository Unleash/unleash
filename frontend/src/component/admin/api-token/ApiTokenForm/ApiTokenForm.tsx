import { Button } from '@material-ui/core';
import { KeyboardArrowDownOutlined } from '@material-ui/icons';
import React from 'react';
import useEnvironments from '../../../../hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from '../../../../hooks/api/getters/useProjects/useProjects';
import GeneralSelect from '../../../common/GeneralSelect/GeneralSelect';
import Input from '../../../common/Input/Input';
import { useStyles } from './ApiTokenForm.styles';
interface IApiTokenFormProps {
    username: string;
    type: string;
    project: string;
    environment: string;
    setTokenType: (value: string) => void;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setProject: React.Dispatch<React.SetStateAction<string>>;
    setEnvironment: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: string;
    clearErrors: () => void;
}
const ApiTokenForm: React.FC<IApiTokenFormProps> = ({
    children,
    username,
    type,
    project,
    environment,
    setUsername,
    setTokenType,
    setProject,
    setEnvironment,
    handleSubmit,
    handleCancel,
    errors,
    clearErrors,
    mode,
}) => {
    const TYPE_ADMIN = 'ADMIN';
    const styles = useStyles();
    const { environments } = useEnvironments();
    const { projects } = useProjects();

    const selectableTypes = [
        { key: 'CLIENT', label: 'Client', title: 'Client SDK token' },
        { key: 'ADMIN', label: 'Admin', title: 'Admin API token' },
    ];

    const selectableProjects = [{ id: '*', name: 'ALL' }, ...projects].map(
        i => ({
            key: i.id,
            label: i.name,
            title: i.name,
        })
    );
    const selectableEnvs =
        type === TYPE_ADMIN
            ? [{ key: '*', label: 'ALL' }]
            : environments.map(i => ({
                  key: i.name,
                  label: i.name,
                  title: i.name,
              }));

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formHeader}>Token information</h3>

            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    Who are you generating the token for?
                </p>
                <Input
                    className={styles.input}
                    value={username}
                    name="username"
                    onChange={e => setUsername(e.target.value)}
                    label="Username"
                    error={errors.username !== undefined}
                    errorText={errors.username}
                    onFocus={() => clearErrors()}
                />
                <p className={styles.inputDescription}>
                    What is your token type?
                </p>
                <GeneralSelect
                    options={selectableTypes}
                    value={type}
                    onChange={e => setTokenType(e.target.value as string)}
                    label="Token Type"
                    id="api_key_type"
                    name="type"
                    IconComponent={KeyboardArrowDownOutlined}
                    className={styles.selectInput}
                />
                <p className={styles.inputDescription}>
                    Which project do you want to give access to?
                </p>
                <GeneralSelect
                    disabled={type === TYPE_ADMIN}
                    value={project}
                    options={selectableProjects}
                    onChange={e => setProject(e.target.value as string)}
                    label="Project"
                    IconComponent={KeyboardArrowDownOutlined}
                    className={styles.selectInput}
                />
                <p className={styles.inputDescription}>
                    Which environment should the token have access to?
                </p>
                <GeneralSelect
                    disabled={type === TYPE_ADMIN}
                    options={selectableEnvs}
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as string)}
                    label="Environment"
                    id="api_key_environment"
                    name="environment"
                    IconComponent={KeyboardArrowDownOutlined}
                    className={styles.selectInput}
                />
            </div>
            <div className={styles.buttonContainer}>
                {children}
                <Button onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default ApiTokenForm;
