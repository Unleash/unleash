/* eslint-disable no-alert */
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Icon,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { formatFullDateTimeWithLocale } from '../../../component/common/util';
import CreateApiKey from './api-key-create';
import Secret from './secret';
import ConditionallyRender from '../../../component/common/ConditionallyRender/ConditionallyRender';
import Dialogue from '../../../component/common/Dialogue/Dialogue';
import AccessContext from '../../../contexts/AccessContext';
import {
    DELETE_API_TOKEN,
    CREATE_API_TOKEN,
} from '../../../component/AccessProvider/permissions';
import PageContent from '../../../component/common/PageContent';
import HeaderTitle from '../../../component/common/HeaderTitle';

function ApiKeyList({
    location,
    fetchApiKeys,
    removeKey,
    addKey,
    keys,
    unleashUrl,
}) {
    const [show, setShow] = useState(false);

    const { hasAccess } = useContext(AccessContext);
    const [showDelete, setShowDelete] = useState(false);
    const [delKey, setDelKey] = useState(undefined);
    const deleteKey = async () => {
        await removeKey(delKey);
        setDelKey(undefined);
        setShowDelete(false);
    };

    useEffect(() => {
        fetchApiKeys();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PageContent
            headerContent={
                <HeaderTitle
                    title="API Access"
                    actions={
                        <ConditionallyRender
                            condition={hasAccess(CREATE_API_TOKEN)}
                            show={
                                <CreateApiKey
                                    addKey={addKey}
                                    setShow={setShow}
                                    show={show}
                                />
                            }
                        />
                    }
                />
            }
        >
            <div>
                <Alert severity="info">
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
                    <pre style={{ display: 'inline' }}>{unleashUrl}/api/</pre>
                </Alert>

                <br />
                <br />

                <br />
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Created</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Access Type</TableCell>
                            <TableCell>Secret</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {keys.map(item => (
                            <TableRow key={item.secret}>
                                <TableCell style={{ textAlign: 'left' }}>
                                    {formatFullDateTimeWithLocale(
                                        item.createdAt,
                                        location.locale
                                    )}
                                </TableCell>
                                <TableCell style={{ textAlign: 'left' }}>
                                    {item.username}
                                </TableCell>
                                <TableCell style={{ textAlign: 'left' }}>
                                    {item.type}
                                </TableCell>
                                <TableCell style={{ textAlign: 'left' }}>
                                    <Secret value={item.secret} />
                                </TableCell>
                                <ConditionallyRender
                                    condition={hasAccess(DELETE_API_TOKEN)}
                                    show={
                                        <TableCell
                                            style={{ textAlign: 'right' }}
                                        >
                                            <IconButton
                                                onClick={() => {
                                                    setDelKey(item.secret);
                                                    setShowDelete(true);
                                                }}
                                            >
                                                <Icon>delete</Icon>
                                            </IconButton>
                                        </TableCell>
                                    }
                                />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Dialogue
                    open={showDelete}
                    onClick={deleteKey}
                    onClose={() => {
                        setShowDelete(false);
                        setDelKey(undefined);
                    }}
                    title="Really delete API key?"
                >
                    <div>Are you sure you want to delete?</div>
                </Dialogue>
            </div>
        </PageContent>
    );
}

ApiKeyList.propTypes = {
    location: PropTypes.object,
    fetchApiKeys: PropTypes.func.isRequired,
    removeKey: PropTypes.func.isRequired,
    addKey: PropTypes.func.isRequired,
    keys: PropTypes.array.isRequired,
    unleashUrl: PropTypes.string,
};

export default ApiKeyList;
