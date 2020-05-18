import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from 'react-mdl';
import styles from './variant.scss';
import { UPDATE_FEATURE } from '../../../permissions';

function VariantViewComponent({ variant, editVariant, removeVariant, hasPermission }) {
    return (
        <tr>
            <td onClick={editVariant}>{variant.name}</td>
            <td>{variant.weight}</td>
            {hasPermission(UPDATE_FEATURE) ? (
                <td className={styles.actions}>
                    <IconButton name="expand_more" onClick={editVariant} />
                    <IconButton name="delete" onClick={removeVariant} />
                </td>
            ) : (
                <td className={styles.actions} />
            )}
        </tr>
    );
}

VariantViewComponent.propTypes = {
    variant: PropTypes.object,
    removeVariant: PropTypes.func,
    editVariant: PropTypes.func,
    hasPermission: PropTypes.func.isRequired,
};

export default VariantViewComponent;
