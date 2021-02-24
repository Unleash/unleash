/* eslint-disable no-alert */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-mdl';
import { formatFullDateTimeWithLocale } from '../../../component/common/util';
import CreateApiKey from './api-key-create';
import Secret from './secret';
import ApiHowTo from './api-howto';

function ApiKeyList({ location, fetchApiKeys, removeKey, addKey, keys, hasPermission }) {
    const deleteKey = async key => {
        const shouldDelte = confirm('Are you sure?');
        if (shouldDelte) {
            await removeKey(key);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, []);

    return (
        <div>
            <ApiHowTo />
            <table className="mdl-data-table mdl-shadow--2dp">
                <thead>
                    <tr>
                        <th className="mdl-data-table__cell--non-numeric" width="20" style={{ textAlign: 'left' }}>
                            Created
                        </th>
                        <th className="mdl-data-table__cell--non-numeric" width="20" style={{ textAlign: 'left' }}>
                            Username
                        </th>
                        <th className="mdl-data-table__cell--non-numeric" width="10" style={{ textAlign: 'left' }}>
                            Acess Type
                        </th>
                        <th className="mdl-data-table__cell--non-numeric" style={{ textAlign: 'left' }}>
                            Secret
                        </th>
                        <th className="mdl-data-table__cell--non-numeric" width="10" style={{ textAlign: 'lerightft' }}>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map(item => (
                        <tr key={item.key}>
                            <td style={{ textAlign: 'left' }}>
                                {formatFullDateTimeWithLocale(item.created, location.locale)}
                            </td>
                            <td style={{ textAlign: 'left' }}>{item.username}</td>
                            <td style={{ textAlign: 'left' }}>{item.priviliges[0]}</td>
                            <td style={{ textAlign: 'left' }}>
                                <Secret value={item.key} />
                            </td>
                            {hasPermission('ADMIN') ? (
                                <td style={{ textAlign: 'right' }}>
                                    <a
                                        href=""
                                        onClick={e => {
                                            e.preventDefault();
                                            deleteKey(item.key);
                                        }}
                                    >
                                        <Icon name="delete" />
                                    </a>
                                </td>
                            ) : (
                                <td />
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            {hasPermission('ADMIN') ? <CreateApiKey addKey={addKey} /> : null}
        </div>
    );
}

ApiKeyList.propTypes = {
    location: PropTypes.object,
    fetchApiKeys: PropTypes.func.isRequired,
    removeKey: PropTypes.func.isRequired,
    addKey: PropTypes.func.isRequired,
    keys: PropTypes.object.isRequired,
    hasPermission: PropTypes.func.isRequired,
};

export default ApiKeyList;
