import { useContext, useState } from 'react';
import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import AccessContext from 'contexts/AccessContext';
import useToast from 'hooks/useToast';
import useLoading from 'hooks/useLoading';
import useApiTokens from 'hooks/api/getters/useApiTokens/useApiTokens';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useApiTokensApi from 'hooks/api/actions/useApiTokensApi/useApiTokensApi';
import ApiError from 'component/common/ApiError/ApiError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DELETE_API_TOKEN } from 'component/providers/AccessProvider/permissions';
import { Delete, FileCopy } from '@mui/icons-material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import copy from 'copy-to-clipboard';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { ProjectsList } from './ProjectsList/ProjectsList';
import { useStyles } from './ApiTokenList.styles';

interface IApiToken {
    createdAt: Date;
    username: string;
    secret: string;
    type: string;
    project?: string;
    projects?: string | string[];
    environment: string;
}

export const ApiTokenList = () => {
    const { classes: styles } = useStyles();
    const { hasAccess } = useContext(AccessContext);
    const { uiConfig } = useUiConfig();
    const [showDelete, setShowDelete] = useState(false);
    const [delToken, setDeleteToken] = useState<IApiToken>();
    const { locationSettings } = useLocationSettings();
    const { setToastData } = useToast();
    const { tokens, loading, refetch, error } = useApiTokens();
    const { deleteToken } = useApiTokensApi();
    const ref = useLoading(loading);

    const renderError = () => {
        return <ApiError onClick={refetch} text="Error fetching api tokens" />;
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
            title: 'Deleted successfully',
            text: 'Successfully deleted API token.',
        });
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
                                        Projects
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
                                    {formatDateYMD(
                                        item.createdAt,
                                        locationSettings.locale
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
                                                <ProjectsList
                                                    project={item.project}
                                                    projects={item.projects}
                                                />
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
                                                <b>Projects:</b>{' '}
                                                <ProjectsList
                                                    project={item.project}
                                                    projects={item.projects}
                                                />
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
                                    <Box
                                        component="span"
                                        display="inline-block"
                                        width="250px"
                                    >
                                        ************************************
                                    </Box>
                                </TableCell>
                                <TableCell className={styles.actionsContainer}>
                                    <Tooltip title="Copy token" arrow>
                                        <IconButton
                                            onClick={() => {
                                                copyToken(item.secret);
                                            }}
                                            size="large"
                                        >
                                            <FileCopy />
                                        </IconButton>
                                    </Tooltip>
                                    <ConditionallyRender
                                        condition={hasAccess(DELETE_API_TOKEN)}
                                        show={
                                            <Tooltip title="Delete token" arrow>
                                                <IconButton
                                                    onClick={() => {
                                                        setDeleteToken(item);
                                                        setShowDelete(true);
                                                    }}
                                                    size="large"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
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
                            <strong>type</strong>: <code>{delToken?.type}</code>
                        </li>
                    </ul>
                </div>
            </Dialogue>
        </div>
    );
};
