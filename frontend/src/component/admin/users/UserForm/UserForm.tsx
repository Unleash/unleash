import Input from '../../../common/Input/Input';
import {
    FormControlLabel,
    Button,
    RadioGroup,
    FormControl,
    Typography,
    Radio,
    Switch,
} from '@material-ui/core';
import { useStyles } from './UserForm.styles';
import React from 'react';
import useUsers from '../../../../hooks/api/getters/useUsers/useUsers';
import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';
import { EDIT } from '../../../../constants/misc';
import useUiBootstrap from '../../../../hooks/api/getters/useUiBootstrap/useUiBootstrap';

interface IUserForm {
    email: string;
    name: string;
    rootRole: number;
    sendEmail: boolean;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
    setRootRole: React.Dispatch<React.SetStateAction<number>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    clearErrors: () => void;
    mode?: string;
}

const UserForm: React.FC<IUserForm> = ({
    children,
    email,
    name,
    rootRole,
    sendEmail,
    setEmail,
    setName,
    setSendEmail,
    setRootRole,
    handleSubmit,
    handleCancel,
    errors,
    clearErrors,
    mode,
}) => {
    const styles = useStyles();
    const { roles } = useUsers();
    const { bootstrap } = useUiBootstrap();

    // @ts-expect-error
    const sortRoles = (a, b) => {
        if (b.name[0] < a.name[0]) {
            return 1;
        } else if (a.name[0] < b.name[0]) {
            return -1;
        }
        return 0;
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formHeader}>User information</h3>

            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    Who is the new Unleash user?
                </p>
                <Input
                    className={styles.input}
                    label="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                    autoFocus
                />
                <Input
                    className={styles.input}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={Boolean(errors.email)}
                    errorText={errors.email}
                    onFocus={() => clearErrors()}
                />
                <FormControl>
                    <Typography
                        variant="subtitle1"
                        className={styles.roleSubtitle}
                        data-loading
                    >
                        What is your team member allowed to do?
                    </Typography>
                    <RadioGroup
                        name="rootRole"
                        value={rootRole || ''}
                        onChange={e => setRootRole(+e.target.value)}
                        data-loading
                    >
                        {/* @ts-expect-error */}
                        {roles.sort(sortRoles).map(role => (
                            <FormControlLabel
                                key={`role-${role.id}`}
                                labelPlacement="end"
                                className={styles.roleBox}
                                label={
                                    <div>
                                        <strong>{role.name}</strong>
                                        <Typography variant="body2">
                                            {role.description}
                                        </Typography>
                                    </div>
                                }
                                control={
                                    <Radio
                                        checked={role.id === rootRole}
                                        className={styles.roleRadio}
                                    />
                                }
                                value={role.id}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
                <ConditionallyRender
                    condition={mode !== EDIT && bootstrap?.email}
                    show={
                        <FormControl>
                            <Typography
                                variant="subtitle1"
                                className={styles.roleSubtitle}
                                data-loading
                            >
                                Should we send an email to your new team member
                            </Typography>
                            <div className={styles.flexRow}>
                                <Switch
                                    name="sendEmail"
                                    onChange={() => setSendEmail(!sendEmail)}
                                    checked={sendEmail}
                                />
                                <Typography>
                                    {sendEmail ? 'Yes' : 'No'}
                                </Typography>
                            </div>
                        </FormControl>
                    }
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

export default UserForm;
