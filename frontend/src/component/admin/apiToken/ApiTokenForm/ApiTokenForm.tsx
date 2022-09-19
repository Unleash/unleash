import {
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
    Box,
} from '@mui/material';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import React from 'react';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SelectProjectInput } from './SelectProjectInput/SelectProjectInput';
import { ApiTokenFormErrorType } from './useApiTokenForm';
import { useStyles } from './ApiTokenForm.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TokenType } from 'interfaces/token';
import { CorsTokenAlert } from 'component/admin/cors/CorsTokenAlert';

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
    const { uiConfig } = useUiConfig();
    const { classes: styles } = useStyles();
    const { environments } = useEnvironments();
    const { projects: availableProjects } = useProjects();

    const selectableTypes = [
        {
            key: TokenType.CLIENT,
            label: `Server-side SDK (${TokenType.CLIENT})`,
            title: 'Connect server-side SDK or Unleash Proxy',
        },
        {
            key: TokenType.ADMIN,
            label: TokenType.ADMIN,
            title: 'Full access for managing Unleash',
        },
    ];

    if (uiConfig.flags.embedProxyFrontend) {
        selectableTypes.splice(1, 0, {
            key: TokenType.FRONTEND,
            label: `Client-side SDK (${TokenType.FRONTEND})`,
            title: 'Connect web and mobile SDK directly to Unleash',
        });
    }

    const selectableProjects = availableProjects.map(project => ({
        value: project.id,
        label: project.name,
    }));

    const selectableEnvs =
        type === TokenType.ADMIN
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
                    What would you like to call this token?
                </p>
                <Input
                    className={styles.input}
                    value={username}
                    name="username"
                    onChange={e => setUsername(e.target.value)}
                    label="Token name"
                    error={errors.username !== undefined}
                    errorText={errors.username}
                    onFocus={() => clearErrors('username')}
                    autoFocus
                />
                <FormControl className={styles.radioGroup}>
                    <label id="token-type" className={styles.inputDescription}>
                        What do you want to connect?
                    </label>
                    <RadioGroup
                        aria-labelledby="token-type"
                        defaultValue="CLIENT"
                        name="radio-buttons-group"
                        value={type}
                        onChange={(event, value) => setTokenType(value)}
                    >
                        {selectableTypes.map(({ key, label, title }) => (
                            <FormControlLabel
                                key={key}
                                value={key}
                                className={styles.radioItem}
                                control={<Radio className={styles.radio} />}
                                label={
                                    <>
                                        <Typography>{label}</Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {title}
                                        </Typography>
                                    </>
                                }
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
                <p className={styles.inputDescription}>
                    Which project do you want to give access to?
                </p>
                <SelectProjectInput
                    disabled={type === TokenType.ADMIN}
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
                    disabled={type === TokenType.ADMIN}
                    options={selectableEnvs}
                    value={environment}
                    onChange={setEnvironment}
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
            <ConditionallyRender
                condition={type === TokenType.FRONTEND}
                show={
                    <Box sx={{ mt: 4 }}>
                        <CorsTokenAlert />
                    </Box>
                }
            />
        </form>
    );
};

export default ApiTokenForm;
