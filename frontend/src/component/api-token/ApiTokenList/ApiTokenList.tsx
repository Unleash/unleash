import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import AccessContext from '../../../contexts/AccessContext';
import useToast from '../../../hooks/useToast';
import useLoading from '../../../hooks/useLoading';
import useApiTokens from '../../../hooks/api/getters/useApiTokens/useApiTokens';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import useApiTokensApi, { IApiTokenCreate } from '../../../hooks/api/actions/useApiTokensApi/useApiTokensApi';
import ApiError from '../../common/ApiError/ApiError';
import PageContent from '../../common/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import ConditionallyRender from '../../common/ConditionallyRender';
import { CREATE_API_TOKEN, DELETE_API_TOKEN } from '../../AccessProvider/permissions';
import { useStyles } from './ApiTokenList.styles';
import { formatDateWithLocale } from '../../common/util';
import Secret from './secret';
import { Delete } from '@material-ui/icons';
import ApiTokenCreate from '../ApiTokenCreate/ApiTokenCreate';
import Dialogue from '../../common/Dialogue';

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
    const { toast, setToastData } = useToast();
    const { tokens, loading, refetch, error } = useApiTokens();
    const { deleteToken, createToken } = useApiTokensApi();
    const ref = useLoading(loading);

    const [showDialog, setDialog] = useState(false);

    const openDialog = () => {
        setDialog(true);
    };

    const closeDialog = () => {
        setDialog(false);
    };
       

    const renderError = () => {
        return (
            <ApiError
                onClick={refetch}
                // className={styles.apiError}
                text="Error fetching api tokens"
            />
        );
    };

    const onCreateToken = async (token: IApiTokenCreate) => {
        await createToken(token);
        refetch();
        setToastData({
            type: 'success',
            show: true,
            text: 'Successfully created API token.',
        });
    }

    const onDeleteToken = async () => {
        if(delToken) {
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
        if(!projectId || projectId === '*') {
            return projectId;
        } else {
            return (<Link to={`/projects/${projectId}`}>{projectId}</Link>);
        }
    }

    const renderApiTokens = (tokens: IApiToken[]) => {
        return (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Created</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell className={styles.center}>Type</TableCell>
                        <ConditionallyRender condition={uiConfig.flags.E} show={<>
                            <TableCell className={styles.center}>Project</TableCell>
                            <TableCell className={styles.center}>Environment</TableCell>
                        </>} />
                        <TableCell>Secret</TableCell>
                        <TableCell align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tokens.map(item => {
                        return (
                            <TableRow key={item.secret}>
                                <TableCell align="left">
                                    {formatDateWithLocale(
                                        item.createdAt,
                                        location.locale
                                    )}
                                </TableCell>
                                <TableCell align="left">
                                    {item.username}
                                </TableCell>
                                <TableCell className={styles.center}>
                                    {item.type}
                                </TableCell>
                                <ConditionallyRender condition={uiConfig.flags.E} show={<>
                                    <TableCell className={styles.center}>
                                        {renderProject(item.project)}
                                    </TableCell>
                                    <TableCell className={styles.center}>
                                        {item.environment}
                                    </TableCell>
                                </>} />

                                <TableCell>
                                    <Secret value={item.secret} />
                                </TableCell>
                                <ConditionallyRender
                                    condition={hasAccess(DELETE_API_TOKEN)}
                                    show={<TableCell
                                        width="20"
                                        style={{ textAlign: 'right' }}
                                    >
                                        <IconButton
                                            onClick={() => {
                                                setDeleteToken(item);
                                                setShowDelete(true);
                                            } }
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>} />
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>)
    }

    return (
        <div ref={ref}>
            <PageContent
                headerContent={<HeaderTitle
                    title="API Access"
                    actions={<ConditionallyRender
                        condition={hasAccess(CREATE_API_TOKEN)}
                        show={<Button variant="contained" color="primary" onClick={openDialog}>Create API token</Button>} />} />}
                >
                <ConditionallyRender condition={error} show={renderError()} />
                <div className={styles.container}>
                    <ConditionallyRender
                        condition={tokens.length < 1 && !loading}
                        show={<div>No API tokens available.</div>}
                        elseShow={renderApiTokens(tokens)}
                    />
                </div>
                {toast}
                <ApiTokenCreate showDialog={showDialog} createToken={onCreateToken} closeDialog={closeDialog} />
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
                        Are you sure you want to delete the following API token?<br />
                        <ul>
                        <li><strong>username</strong>: <code>{delToken?.username}</code></li>
                        <li><strong>type</strong>: <code>{delToken?.type}</code></li>
                        </ul>
                    </div>
                </Dialogue>
            </PageContent>
        </div>
    );
};

export default ApiTokenList;
