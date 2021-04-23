import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
    TextField,
    DialogContent,
    RadioGroup,
    Radio,
    FormControl,
    FormControlLabel,
    Typography,
} from '@material-ui/core';

import { trim } from '../../../../../component/common/util';
import { useCommonStyles } from '../../../../../common.styles';
import ConditionallyRender from '../../../../../component/common/ConditionallyRender';
import { useStyles } from './AddUserForm.styles';
import useLoading from '../../../../../hooks/useLoading';
import {
    ADD_USER_ERROR,
    UPDATE_USER_ERROR,
} from '../../../../../hooks/useAdminUsersApi';
import { Alert } from '@material-ui/lab';

function AddUserForm({
    submit,
    data,
    error,
    setData,
    roles,
    userLoading,
    userApiErrors,
}) {
    const ref = useLoading(userLoading);
    const commonStyles = useCommonStyles();
    const styles = useStyles();

    const updateField = e => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const updateFieldWithTrim = e => {
        setData({
            ...data,
            [e.target.name]: trim(e.target.value),
        });
    };

    const updateNumberField = e => {
        setData({
            ...data,
            [e.target.name]: +e.target.value,
        });
    };

    const apiError =
        userApiErrors[ADD_USER_ERROR] || userApiErrors[UPDATE_USER_ERROR];
    return (
        <div ref={ref}>
            <form onSubmit={submit}>
                <DialogContent>
                    <ConditionallyRender
                        condition={apiError}
                        show={
                            <Alert
                                className={styles.errorAlert}
                                severity="error"
                                data-loading
                            >
                                {apiError}
                            </Alert>
                        }
                    />
                    <div
                        className={classnames(
                            commonStyles.contentSpacingY,
                            commonStyles.flexColumn,
                            styles.userInfoContainer
                        )}
                    >
                        <Typography variant="subtitle1" data-loading>
                            Who is your team member?
                        </Typography>
                        <ConditionallyRender
                            condition={error.general}
                            show={
                                <p data-loading style={{ color: 'red' }}>
                                    {error.general}
                                </p>
                            }
                        />

                        <TextField
                            label="Full name"
                            data-loading
                            name="name"
                            value={data.name || ''}
                            error={error.name !== undefined}
                            helperText={error.name}
                            type="name"
                            variant="outlined"
                            size="small"
                            onChange={updateField}
                        />
                        <TextField
                            label="Email"
                            data-loading
                            name="email"
                            required
                            value={data.email || ''}
                            error={error.email !== undefined}
                            helperText={error.email}
                            variant="outlined"
                            size="small"
                            type="email"
                            onChange={updateFieldWithTrim}
                        />
                        <br />
                        <br />
                    </div>
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
                            value={data.rootRole || ''}
                            onChange={updateNumberField}
                            data-loading
                        >
                            {roles.map(role => (
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
                                            checked={role.id === data.rootRole}
                                            className={styles.roleRadio}
                                        />
                                    }
                                    value={role.id}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
            </form>
        </div>
    );
}

AddUserForm.propTypes = {
    data: PropTypes.object.isRequired,
    error: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    setData: PropTypes.func.isRequired,
    roles: PropTypes.array.isRequired,
};

export default AddUserForm;
