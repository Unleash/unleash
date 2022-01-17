import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import AccessContext from '../../../../contexts/AccessContext';
import useToast from '../../../../hooks/useToast';
import useLoading from '../../../../hooks/useLoading';
import useApiTokens from '../../../../hooks/api/getters/useApiTokens/useApiTokens';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useApiTokensApi from '../../../../hooks/api/actions/useApiTokensApi/useApiTokensApi';
import ApiError from '../../../common/ApiError/ApiError';
import PageContent from '../../../common/PageContent';
import HeaderTitle from '../../../common/HeaderTitle';
import ConditionallyRender from '../../../common/ConditionallyRender';
import {
    CREATE_API_TOKEN,
    DELETE_API_TOKEN,
} from '../../../providers/AccessProvider/permissions';
import { useStyles } from './ApiTokenList.styles';
import { formatDateWithLocale } from '../../../common/util';
import Secret from './secret';
import { Delete, FileCopy } from '@material-ui/icons';
import Dialogue from '../../../common/Dialogue';
import { CREATE_API_TOKEN_BUTTON } from '../../../../testIds';
import { Alert } from '@material-ui/lab';
import copy from 'copy-to-clipboard';

interface IApiToken {
    createdAt: Date;
    username: string;
    secret: string;
    type: string;
    project: string;
    environment: string;
}

interface IApiTokenList {
    location: any;
}

const ApiTokenList = ({ location }: IApiTokenList) => {
    const styles = useStyles();
    const { hasAccess } = useContext(AccessContext);
    const { uiConfig } = useUiConfig();
    const [showDelete, setShowDelete] = useState(false);
    const [delToken, setDeleteToken] = useState<IApiToken>();
    const { setToastData } = useToast();
    const { tokens, loading, refetch, error } = useApiTokens();
    const { deleteToken } = useApiTokensApi();
    const ref = useLoading(loading);
    const history = useHistory();

    const renderError = () => {
        return (
            <ApiError
                onClick={refetch}
                // className={styles.apiError}
                text="Error fetching api tokens"
            />
        );
    };

    const copyToken = (value: string) => {
        if (copy(value)) {
            setToastData({
                type: 'success',
                title: 'Token copied',
                text: `Token is copied to clipboard`,
            });
        }
    };

    const onDeleteToken = async () => {
        if (delToken) {
            await deleteToken(delToken.secret);
        }
        setDeleteToken(undefined);
        setShowDelete(false);
        refetch();
        setToastData({
            type: 'success',
            show: true,
            text: 'Successfully deleted API token.',
        });
    };

    const renderProject = (projectId: string) => {
        if (!projectId || projectId === '*') {
            return projectId;
        } else {
            return <Link to={`/projects/${projectId}`}>{projectId}</Link>;
        }
    };

    const renderApiTokens = (tokens: IApiToken[]) => {
        return (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className={styles.hideSM}>Created</TableCell>
                        <TableCell className={styles.hideSM}>
                            Username
                        </TableCell>
                        <TableCell
                            className={`${styles.center} ${styles.hideXS}`}
                        >
                            Type
                        </TableCell>
                        <ConditionallyRender
                            condition={uiConfig.flags.E}
                            show={
                                <>
                                    <TableCell
                                        className={`${styles.center} ${styles.hideXS}`}
                                    >
                                        Project
                                    </TableCell>
                                    <TableCell
                                        className={`${styles.center} ${styles.hideXS}`}
                                    >
                                        Environment
                                    </TableCell>
                                </>
                            }
                        />
                        <TableCell className={styles.hideMD}>Secret</TableCell>
                        <TableCell className={styles.token}>Token</TableCell>
                        <TableCell className={styles.actionsContainer}>
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tokens.map(item => {
                        return (
                            <TableRow
                                key={item.secret}
                                className={styles.tableRow}
                            >
                                <TableCell
                                    align="left"
                                    className={styles.hideSM}
                                >
                                    {formatDateWithLocale(
                                        item.createdAt,
                                        location.locale
                                    )}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    className={styles.hideSM}
                                >
                                    {item.username}
                                </TableCell>
                                <TableCell
                                    className={`${styles.center} ${styles.hideXS}`}
                                >
                                    {item.type}
                                </TableCell>
                                <ConditionallyRender
                                    condition={uiConfig.flags.E}
                                    show={
                                        <>
                                            <TableCell
                                                className={`${styles.center} ${styles.hideXS}`}
                                            >
                                                {renderProject(item.project)}
                                            </TableCell>
                                            <TableCell
                                                className={`${styles.center} ${styles.hideXS}`}
                                            >
                                                {item.environment}
                                            </TableCell>
                                            <TableCell className={styles.token}>
                                                <b>Type:</b> {item.type}
                                                <br />
                                                <b>Env:</b> {item.environment}
                                                <br />
                                                <b>Project:</b>{' '}
                                                {renderProject(item.project)}
                                            </TableCell>
                                        </>
                                    }
                                    elseShow={
                                        <>
                                            <TableCell className={styles.token}>
                                                <b>Type:</b> {item.type}
                                                <br />
                                                <b>Username:</b> {item.username}
                                            </TableCell>
                                        </>
                                    }
                                />
                                <TableCell className={styles.hideMD}>
                                    <Secret value={item.secret} />
                                </TableCell>
                                <TableCell className={styles.actionsContainer}>
                                    <IconButton
                                        onClick={() => {
                                            copyToken(item.secret);
                                        }}
                                    >
                                        <FileCopy />
                                    </IconButton>
                                    <ConditionallyRender
                                        condition={hasAccess(DELETE_API_TOKEN)}
                                        show={
                                            <IconButton
                                                onClick={() => {
                                                    setDeleteToken(item);
                                                    setShowDelete(true);
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    };

    return (
        <div ref={ref}>
            <PageContent
                headerContent={
                    <HeaderTitle
                        title="API Access"
                        actions={
                            <ConditionallyRender
                                condition={hasAccess(CREATE_API_TOKEN)}
                                show={
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() =>
                                            history.push(
                                                '/admin/api/create-token'
                                            )
                                        }
                                        data-test={CREATE_API_TOKEN_BUTTON}
                                    >
                                        Create API token
                                    </Button>
                                }
                            />
                        }
                    />
                }
            >
                <Alert severity="info" className={styles.infoBoxContainer}>
                    <p>
                        Read the{' '}
                        <a
                            href="https://docs.getunleash.io/docs"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Getting started guide
                        </a>{' '}
                        to learn how to connect to the Unleash API from your
                        application or programmatically. Please note it can take
                        up to 1 minute before a new API key is activated.
                    </p>
                    <br />
                    <strong>API URL: </strong>{' '}
                    <pre style={{ display: 'inline' }}>
                        {uiConfig.unleashUrl}/api/
                    </pre>
                </Alert>

                <ConditionallyRender condition={error} show={renderError()} />
                <div className={styles.container}>
                    <ConditionallyRender
                        condition={tokens.length < 1 && !loading}
                        show={<div>No API tokens available.</div>}
                        elseShow={renderApiTokens(tokens)}
                    />
                </div>

                <Dialogue
                    open={showDelete}
                    onClick={onDeleteToken}
                    onClose={() => {
                        setShowDelete(false);
                        setDeleteToken(undefined);
                    }}
                    title="Confirm deletion"
                >
                    <div>
                        Are you sure you want to delete the following API token?
                        <br />
                        <ul>
                            <li>
                                <strong>username</strong>:{' '}
                                <code>{delToken?.username}</code>
                            </li>
                            <li>
                                <strong>type</strong>:{' '}
                                <code>{delToken?.type}</code>
                            </li>
                        </ul>
                    </div>
                </Dialogue>
            </PageContent>
        </div>
    );
};

export default ApiTokenList;
