import React from 'react';
import { Chip } from 'react-mdl';
import PropTypes from 'prop-types';
import styles from './feature.scss';

export default function StatusComponent({ type, types, onClick }) {
    const typeObject = types.find(o => o.id === type) || { id: type, name: type };

    return (
        <Chip className={styles.typeChip} title={typeObject.description} onClick={onClick}>
            {typeObject.name}
        </Chip>
    );
}

StatusComponent.propTypes = {
    type: PropTypes.string.isRequired,
    types: PropTypes.array,
    onClick: PropTypes.func,
};
