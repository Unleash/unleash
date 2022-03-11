import { useEffect, useState } from 'react';
import ConditionallyRender from '../../common/ConditionallyRender';
import { useStyles } from './ProjectEnvironment.styles';

import useLoading from '../../../hooks/useLoading';
import PageContent from '../../common/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import { UPDATE_PROJECT } from '../../providers/AccessProvider/permissions';

import ApiError from '../../common/ApiError/ApiError';
import useToast from '../../../hooks/useToast';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import useEnvironments from '../../../hooks/api/getters/useEnvironments/useEnvironments';
import useProject from '../../../hooks/api/getters/useProject/useProject';
import { FormControlLabel, FormGroup } from '@material-ui/core';
import useProjectApi from '../../../hooks/api/actions/useProjectApi/useProjectApi';
import EnvironmentDisableConfirm from './EnvironmentDisableConfirm/EnvironmentDisableConfirm';
import { Link } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import PermissionSwitch from '../../common/PermissionSwitch/PermissionSwitch';
import { IProjectEnvironment } from '../../../interfaces/environments';
import { getEnabledEnvs } from './helpers';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useCommonStyles } from 'common.styles';

interface ProjectEnvironmentListProps {
    projectId: string;
}

const ProjectEnvironmentList = ({ projectId }: ProjectEnvironmentListProps) => {
    // api state
    const [envs, setEnvs] = useState<IProjectEnvironment[]>([]);
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const {
        environments,
        loading,
        error,
        refetch: refetchEnvs,
    } = useEnvironments();
    const { project, refetch: refetchProject } = useProject(projectId);
    const { removeEnvironmentFromProject, addEnvironmentToProject } =
        useProjectApi();
    const commonStyles = useCommonStyles();

    // local state
    const [selectedEnv, setSelectedEnv] = useState<IProjectEnvironment>();
    const [confirmName, setConfirmName] = useState('');
    const ref = useLoading(loading);
    const styles = useStyles();

    useEffect(() => {
        const envs = environments.map(e => ({
            name: e.name,
            enabled: project?.environments.includes(e.name),
        }));

        setEnvs(envs);
    }, [environments, project?.environments]);

    const refetch = () => {
        refetchEnvs();
        refetchProject();
    };

    const renderError = () => {
        return (
            <ApiError
                onClick={refetch}
                className={styles.apiError}
                text="Error fetching environments"
            />
        );
    };

    const errorMsg = (enable: boolean): string => {
        return `Got an API error when trying to ${
            enable ? 'enable' : 'disable'
        } the environment.`;
    };

    const toggleEnv = async (env: IProjectEnvironment) => {
        if (env.enabled) {
            const enabledEnvs = getEnabledEnvs(envs);

            if (enabledEnvs > 1) {
                setSelectedEnv(env);
                return;
            }
            setToastData({
                title: 'One environment must be active',
                text: 'You must always have at least one active environment per project',
                type: 'error',
            });
        } else {
            try {
                await addEnvironmentToProject(projectId, env.name);
                setToastData({
                    title: 'Environment enabled',
                    text: 'Environment successfully enabled. You can now use it to segment strategies in your feature toggles.',
                    type: 'success',
                });
            } catch (error) {
                setToastApiError(errorMsg(true));
            }
        }
        refetch();
    };

    const handleDisableEnvironment = async () => {
        if (selectedEnv && confirmName === selectedEnv.name) {
            try {
                await removeEnvironmentFromProject(projectId, selectedEnv.name);
                setSelectedEnv(undefined);
                setConfirmName('');
                setToastData({
                    title: 'Environment disabled',
                    text: 'Environment successfully disabled.',
                    type: 'success',
                });
            } catch (e) {
                setToastApiError(errorMsg(false));
            }

            refetch();
        }
    };

    const handleCancelDisableEnvironment = () => {
        setSelectedEnv(undefined);
        setConfirmName('');
    };

    const genLabel = (env: IProjectEnvironment) => (
        <div className={commonStyles.flexRow}>
            <code>
                <StringTruncator
                    text={env.name}
                    maxLength={50}
                    maxWidth="150"
                />
            </code>
            {/* This is ugly - but regular {" "} doesn't work here*/}
            <p>
                &nbsp; environment is{' '}
                <strong>{env.enabled ? 'enabled' : 'disabled'}</strong>
            </p>
        </div>
    );

    const renderEnvironments = () => {
        return (
            <FormGroup>
                {envs.map(env => (
                    <FormControlLabel
                        key={env.name}
                        label={genLabel(env)}
                        control={
                            <PermissionSwitch
                                tooltip={`${
                                    env.enabled ? 'Disable' : 'Enable'
                                } environment`}
                                size="medium"
                                projectId={projectId}
                                permission={UPDATE_PROJECT}
                                checked={env.enabled}
                                onChange={() => toggleEnv(env)}
                            />
                        }
                    />
                ))}
            </FormGroup>
        );
    };

    return (
        <div ref={ref}>
            <PageContent
                headerContent={
                    <HeaderTitle
                        title={`Configure environments for "${project?.name}" project`}
                    />
                }
            >
                <ConditionallyRender
                    condition={uiConfig.flags.E}
                    show={
                        <div className={styles.container}>
                            <ConditionallyRender
                                condition={error}
                                show={renderError()}
                            />
                            <Alert
                                severity="info"
                                style={{ marginBottom: '20px' }}
                            >
                                <b>Important!</b> In order for your application
                                to retrieve configured activation strategies for
                                a specific environment, the application
                                <br /> must use an environment specific API key.
                                You can look up the environment-specific API
                                keys <Link to="/admin/api">here.</Link>
                                <br />
                                <br />
                                Your administrator can configure an
                                environment-specific API key to be used in the
                                SDK. If you are an administrator you can{' '}
                                <Link to="/admin/api">
                                    create a new API key.
                                </Link>
                            </Alert>
                            <ConditionallyRender
                                condition={environments.length < 1 && !loading}
                                show={<div>No environments available.</div>}
                                elseShow={renderEnvironments()}
                            />
                            <EnvironmentDisableConfirm
                                env={selectedEnv}
                                open={!!selectedEnv}
                                handleDisableEnvironment={
                                    handleDisableEnvironment
                                }
                                handleCancelDisableEnvironment={
                                    handleCancelDisableEnvironment
                                }
                                confirmName={confirmName}
                                setConfirmName={setConfirmName}
                            />
                        </div>
                    }
                    elseShow={
                        <Alert security="success">
                            This feature has not been Unleashed for you yet.
                        </Alert>
                    }
                />
            </PageContent>
        </div>
    );
};

export default ProjectEnvironmentList;
