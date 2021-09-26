import { TextField, } from '@material-ui/core';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import { styles as commonStyles } from '../../../component/common';
import { IApiTokenCreate } from '../../../hooks/api/actions/useApiTokensApi/useApiTokensApi';
import useEnvironments from '../../../hooks/api/getters/useEnvironments/useEnvironments';
import useProjects from '../../../hooks/api/getters/useProjects/useProjects';
import Dialogue from '../../common/Dialogue';
import MySelect from '../../common/select';
import { useStyles } from './styles';

const ALL = '*';
const TYPE_ADMIN = 'ADMIN';
const TYPE_CLIENT = 'CLIENT';

interface IApiTokenCreateProps {
    showDialog: boolean;
    closeDialog: () => void;
    createToken: (token: IApiTokenCreate) => Promise<void>;
}

interface IDataError {
    username?: string;
    general?: string;
}

const INITIAL_DATA: IApiTokenCreate = {
    username: '',
    type: TYPE_CLIENT,
    project: ALL
}

const ApiTokenCreate = ({
    showDialog,
    closeDialog,
    createToken,
}: IApiTokenCreateProps) => {
    const styles = useStyles();
    const [data, setData] = useState(INITIAL_DATA);
    const [error, setError] = useState<IDataError>({});
    const { projects } = useProjects();
    const { environments } = useEnvironments();

    useEffect(() => {
        if(environments && data.type === TYPE_CLIENT && !data.environment) {
            setData({...data, environment: environments[0].name})
        }
    }, [data, environments]);

    const clear = () => {
        setData({...INITIAL_DATA});
        setError({});
    }

    const onCancel = (e: Event) => {
        clear();
        closeDialog();
    };

    const isValid = () => {
        if(!data.username) {
            setError({username: 'Username is required.'});
            return false;
        } else {
            setError({})
            return true;
        }
    }

    

    const submit = async () => {
        if(!isValid()) {
            return;
        }
        
        try {
            await createToken(data);
            clear();
            closeDialog();
        } catch (error) {
            setError({general: 'Unable to create new API token'});
        }

    }

    const setType = (event: React.ChangeEvent<{value: string }>) => {
        const value = event.target.value;
        if(value === TYPE_ADMIN) {  
            setData({...data, type: value, environment: ALL, project: ALL})

        } else {
            setData({...data, type: value, environment: environments[0].name})
        }
        
    }

    const setUsername = (event: React.ChangeEvent<{value: string }>) => {
        const value = event.target.value;
        setData({...data, username: value})
    }

    const setProject = (event:  React.ChangeEvent<{value: string }>) => {
        const value = event.target.value;
        setData({...data, project: value})
    }

    const setEnvironment = (event: React.ChangeEvent<{value: string }>) => {
        const value = event.target.value;
        setData({...data, environment: value})
    }

    const selectableProjects = [{id: '*', name: 'ALL'}, ...projects].map(i => ({
        key: i.id,
        label: i.name,
        title: i.name,
    }));
    
    const selectableEnvs = data.type === TYPE_ADMIN ? [{key: '*', label: 'ALL'}] : environments.map(i => ({
        key: i.name,
        label: i.name,
        title: i.name,
    }));


    const selectableTypes = [
        {key: 'CLIENT', label: 'Client', title: 'Client SDK token'},
        {key: 'ADMIN', label: 'Admin', title: 'Admin API token'}
    ]

    return (
        <Dialogue
            onClick={() => submit()}
            open={showDialog}
            onClose={onCancel}
            primaryButtonText="Create"
            secondaryButtonText="Cancel"
            title="New API token"
        >
            <form
                    onSubmit={submit}
                    className={classNames(
                        styles.addApiKeyForm,
                        commonStyles.contentSpacing
                    )}
                >
                    <TextField
                        value={data.username}
                        name="username"
                        onChange={setUsername}
                        onBlur={isValid}
                        label="Username"
                        style={{ width: '200px' }}
                        error={error.username !== undefined}
                        helperText={error.username}
                        variant="outlined"
                        size="small"
                        required
                    />
                    <MySelect
                        disabled={false}
                        options={selectableTypes}
                        value={data.type}
                        onChange={setType}
                        label="Token Type"
                        id='api_key_type'
                        name="type" className={undefined} classes={undefined}
                    />
                    <MySelect
                        disabled={data.type === TYPE_ADMIN}
                        options={selectableProjects}
                        value={data.project}
                        onChange={setProject}
                        label="Project"
                        id='api_key_project'
                        name="project" className={undefined} classes={undefined}
                    />
                    <MySelect
                        disabled={data.type === TYPE_ADMIN}
                        options={selectableEnvs}
                        value={data.environment}
                        required
                        onChange={setEnvironment}
                        label="Environment"
                        id='api_key_environment'
                        name="environment" className={undefined} classes={undefined}                    />
                </form>
        </Dialogue>
    );
};

export default ApiTokenCreate;
