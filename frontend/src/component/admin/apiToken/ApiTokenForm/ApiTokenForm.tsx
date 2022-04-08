import { Button } from '@material-ui/core';
import { KeyboardArrowDownOutlined } from '@material-ui/icons';
import React from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import { useStyles } from './ApiTokenForm.styles';
import { SelectProjectInput } from './SelectProjectInput/SelectProjectInput';
import { ApiTokenFormErrorType } from '../hooks/useApiTokenForm';
interface IApiTokenFormProps {
    username: string;
    type: string;
    projects: string[];
    environment?: string;
    setTokenType: (value: string) => void;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
    setEnvironment: React.Dispatch<React.SetStateAction<string | undefined>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: (error?: ApiTokenFormErrorType) => void;
}

const ApiTokenForm: React.FC<IApiTokenFormProps> = ({
    children,
    username,
    type,
    projects,
    environment,
    setUsername,
    setTokenType,
    setProjects,
    setEnvironment,
    handleSubmit,
    handleCancel,
    errors,
    clearErrors,
}) => {
    const TYPE_ADMIN = 'ADMIN';
    const styles = useStyles();
    const { environments } = useEnvironments();
    const { projects: availableProjects } = useProjects();

    const selectableTypes = [
        { key: 'CLIENT', label: 'Client', title: 'Client SDK token' },
        { key: 'ADMIN', label: 'Admin', title: 'Admin API token' },
    ];

    const selectableProjects = availableProjects.map(project => ({
        value: project.id,
        label: project.name,
    }));

    const selectableEnvs =
        type === TYPE_ADMIN
            ? [{ key: '*', label: 'ALL' }]
            : environments.map(environment => ({
                  key: environment.name,
                  label: environment.name,
                  title: environment.name,
                  disabled: !environment.enabled,
              }));

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
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
                    onFocus={() => clearErrors('username')}
                    autoFocus
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
                    fullWidth
                    className={styles.selectInput}
                />
                <p className={styles.inputDescription}>
                    Which project do you want to give access to?
                </p>
                <SelectProjectInput
                    disabled={type === TYPE_ADMIN}
                    options={selectableProjects}
                    defaultValue={projects}
                    onChange={setProjects}
                    error={errors?.projects}
                    onFocus={() => clearErrors('projects')}
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
                    fullWidth
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
