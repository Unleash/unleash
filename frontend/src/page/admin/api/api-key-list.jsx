/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, Table, TableHead, TableBody, TableRow, TableCell, IconButton } from '@material-ui/core';
import { formatFullDateTimeWithLocale } from '../../../component/common/util';
import CreateApiKey from './api-key-create';
import Secret from './secret';
import ApiHowTo from './api-howto';
import ConditionallyRender from '../../../component/common/ConditionallyRender/ConditionallyRender';
import Dialogue from '../../../component/common/Dialogue/Dialogue';

function ApiKeyList({ location, fetchApiKeys, removeKey, addKey, keys, hasPermission }) {
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
        <div>
            <ApiHowTo />
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
                                {formatFullDateTimeWithLocale(item.created, location.locale)}
                            </TableCell>
                            <TableCell style={{ textAlign: 'left' }}>{item.username}</TableCell>
                            <TableCell style={{ textAlign: 'left' }}>{item.type}</TableCell>
                            <TableCell style={{ textAlign: 'left' }}>
                                <Secret value={item.secret} />
                            </TableCell>
                            <ConditionallyRender
                                condition={hasPermission('ADMIN')}
                                show={
                                    <TableCell style={{ textAlign: 'right' }}>
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
            <ConditionallyRender
                condition={hasPermission('ADMIN')}
                show={
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
                }
            />
            <ConditionallyRender condition={hasPermission('ADMIN')} show={<CreateApiKey addKey={addKey} />} />
        </div>
    );
}

ApiKeyList.propTypes = {
    location: PropTypes.object,
    fetchApiKeys: PropTypes.func.isRequired,
    removeKey: PropTypes.func.isRequired,
    addKey: PropTypes.func.isRequired,
    keys: PropTypes.array.isRequired,
    hasPermission: PropTypes.func.isRequired,
};

export default ApiKeyList;
