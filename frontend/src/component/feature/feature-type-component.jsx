import React, { memo } from 'react';
import { Chip } from 'react-mdl';
import PropTypes from 'prop-types';
import styles from './feature.scss';

function StatusComponent({ type, types, onClick }) {
    const typeObject = types.find(o => o.id === type) || { id: type, name: type };

    return (
        <Chip className={styles.typeChip} title={typeObject.description} onClick={onClick}>
            {typeObject.name}
        </Chip>
    );
}

export default memo(StatusComponent);

StatusComponent.propTypes = {
    type: PropTypes.string.isRequired,
    types: PropTypes.array,
    onClick: PropTypes.func,
};
