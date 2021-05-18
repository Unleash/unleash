import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Select,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
} from '@material-ui/core';
import Dialogue from '../../../component/common/Dialogue/Dialogue';
import classnames from 'classnames';
import { styles as commonStyles } from '../../../component/common';
import { useStyles } from './styles';

function CreateApiKey({ addKey, show, setShow }) {
    const styles = useStyles();
    const [type, setType] = useState('CLIENT');
    const [username, setUsername] = useState();
    const [error, setError] = useState();

    const toggle = evt => {
        evt.preventDefault();
        setShow(!show);
    };

    const submit = async e => {
        e.preventDefault();
        if (!username) {
            setError('You must define a username');
            return;
        }
        await addKey({ username, type });
        setUsername('');
        setType('CLIENT');
        setShow(false);
    };

    return (
        <div style={{ margin: '5px' }}>
            <Dialogue
                onClick={e => {
                    submit(e);
                    setShow(false);
                }}
                open={show}
                primaryButtonText="Create new key"
                onClose={toggle}
                secondaryButtonText="Cancel"
                title="Add new API key"
            >
                <form
                    onSubmit={submit}
                    className={classnames(
                        styles.addApiKeyForm,
                        commonStyles.contentSpacing
                    )}
                >
                    <TextField
                        value={username || ''}
                        name="username"
                        onChange={e => setUsername(e.target.value)}
                        label="Username"
                        style={{ width: '200px' }}
                        error={error !== undefined}
                        helperText={error}
                        variant="outlined"
                        size="small"
                    />
                    <FormControl
                        variant="outlined"
                        size="small"
                        style={{ minWidth: '120px' }}
                    >
                        <InputLabel id="apikey_type" />
                        <Select
                            labelId="apikey_type"
                            id="apikey_select"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <MenuItem
                                value="CLIENT"
                                key="apikey_client"
                                title="Client"
                            >
                                Client
                            </MenuItem>
                            <MenuItem
                                value="ADMIN"
                                key="apikey_admin"
                                title="Admin"
                            >
                                Admin
                            </MenuItem>
                        </Select>
                    </FormControl>
                </form>
            </Dialogue>
            <Button onClick={toggle} variant="contained" color="primary">
                Add new API key
            </Button>
        </div>
    );
}

CreateApiKey.propTypes = {
    addKey: PropTypes.func.isRequired,
    setShow: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default CreateApiKey;
