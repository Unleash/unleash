import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Textfield, Button } from 'react-mdl';

function CreateApiKey({ addKey }) {
    const [type, setType] = useState('CLIENT');
    const [show, setShow] = useState(false);
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
            {show ? (
                <form onSubmit={submit}>
                    <Textfield
                        value={username}
                        name="username"
                        onChange={e => setUsername(e.target.value)}
                        label="Username"
                        floatingLabel
                        style={{ width: '200px' }}
                        error={error}
                    />

                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="CLIENT">Client</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <Button primary mini="true" type="submit">
                        Create new key
                    </Button>
                </form>
            ) : (
                <a href="" onClick={toggle}>
                    Add new access key
                </a>
            )}
        </div>
    );
}

CreateApiKey.propTypes = {
    addKey: PropTypes.func.isRequired,
};

export default CreateApiKey;
