import React from 'react';
import PropTypes from 'prop-types';

import { IconButton, Chip } from 'react-mdl';
import styles from './variant.scss';
import { UPDATE_FEATURE } from '../../../permissions';

function VariantViewComponent({ variant, editVariant, removeVariant, hasPermission }) {
    return (
        <tr>
            <td onClick={editVariant}>{variant.name}</td>
            <td className={styles.labels}>
                {variant.payload ? <Chip>Payload</Chip> : undefined}{' '}
                {variant.overrides && variant.overrides.length > 0 ? (
                    <Chip style={{ backgroundColor: 'rgba(173, 216, 230, 0.2)' }}>Overrides</Chip>
                ) : (
                    undefined
                )}
            </td>
            <td>{variant.weight / 10.0} %</td>
            {hasPermission(UPDATE_FEATURE) ? (
                <td className={styles.actions}>
                    <IconButton name="edit" onClick={editVariant} />
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
