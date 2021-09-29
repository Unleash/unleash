import React, { useState } from 'react';
import { FormControl, Button } from '@material-ui/core';
import HeaderTitle from '../../common/HeaderTitle';
import PageContent from '../../common/PageContent';

import { useStyles } from './CreateEnvironment.styles';
import { useHistory } from 'react-router-dom';
import useEnvironmentApi from '../../../hooks/api/actions/useEnvironmentApi/useEnvironmentApi';
import ConditionallyRender from '../../common/ConditionallyRender';
import CreateEnvironmentSuccess from './CreateEnvironmentSuccess/CreateEnvironmentSuccess';
import useLoading from '../../../hooks/useLoading';
import useToast from '../../../hooks/useToast';
import EnvironmentTypeSelector from '../form/EnvironmentTypeSelector/EnvironmentTypeSelector';
import Input from '../../common/Input/Input';

const NAME_EXISTS_ERROR = 'Error: Environment';

const CreateEnvironment = () => {
    const [type, setType] = useState('development');
    const [envName, setEnvName] = useState('');
    const [nameError, setNameError] = useState('');
    const [createSuccess, setCreateSucceess] = useState(false);
    const history = useHistory();
    const styles = useStyles();
    const { validateEnvName, createEnvironment, loading } = useEnvironmentApi();
    const ref = useLoading(loading);
    const { toast, setToastData } = useToast();

    const handleTypeChange = (event: React.FormEvent<HTMLInputElement>) => {
        setType(event.currentTarget.value);
    };

    const handleEnvNameChange = (e: React.FormEvent<HTMLInputElement>) => {
        setEnvName(e.currentTarget.value);
    };

    const goBack = () => history.goBack();

    const validateEnvironmentName = async () => {
        if (envName.length === 0) {
            setNameError('Environment Id can not be empty.');
            return false;
        }

        try {
            await validateEnvName(envName);
        } catch (e) {
            if (e.toString().includes(NAME_EXISTS_ERROR)) {
                setNameError('Name already exists');
            }
            return false;
        }
        return true;
    };

    const clearNameError = () => setNameError('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validName = await validateEnvironmentName();

        if (validName) {
            const environment = {
                name: envName,
                type,
            };

            try {
                await createEnvironment(environment);
                setCreateSucceess(true);
            } catch (e) {
                setToastData({ show: true, type: 'error', text: e.toString() });
            }
        }
    };

    return (
        <PageContent headerContent={<HeaderTitle title="Create environment" />}>
            <ConditionallyRender
                condition={createSuccess}
                show={
                    <CreateEnvironmentSuccess
                        name={envName}
                        type={type}
                    />
                }
                elseShow={
                    <div ref={ref}>
                        <p className={styles.helperText} data-loading>
                            Environments allow you to manage your product
                            lifecycle from local development through production.
                            Your projects and feature toggles are accessible in
                            all your environments, but they can take different
                            configurations per environment. This means that you
                            can enable a feature toggle in a development or test
                            environment without enabling the feature toggle in
                            the production environment.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <FormControl component="fieldset">
                                <h3 className={styles.formHeader} data-loading>
                                    Environment Id and name
                                </h3>

                                <div
                                    data-loading
                                    className={
                                        styles.environmentDetailsContainer
                                    }
                                >
                                    <p>
                                        Unique env name for SDK configurations.
                                    </p>
                                    <Input
                                        label="Environment Id"
                                        onFocus={clearNameError}
                                        placeholder="A unique name for your environment"
                                        onBlur={validateEnvironmentName}
                                        error={Boolean(nameError)}
                                        errorText={nameError}
                                        value={envName}
                                        onChange={handleEnvNameChange}
                                        className={styles.inputField}
                                    />
                                </div>

                                <EnvironmentTypeSelector
                                    onChange={handleTypeChange}
                                    value={type}
                                />
                            </FormControl>
                            <div className={styles.btnContainer}>
                                <Button
                                    className={styles.submitButton}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    data-loading
                                >
                                    Submit
                                </Button>{' '}
                                <Button
                                    className={styles.submitButton}
                                    variant="outlined"
                                    color="secondary"
                                    onClick={goBack}
                                    data-loading
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                }
            />
            {toast}
        </PageContent>
    );
};

export default CreateEnvironment;
