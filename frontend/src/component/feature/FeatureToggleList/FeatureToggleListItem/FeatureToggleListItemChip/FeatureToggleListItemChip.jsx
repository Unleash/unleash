import React, { memo } from 'react';
import { Chip } from '@material-ui/core';
import PropTypes from 'prop-types';

import { useStyles } from './styles';

const FeatureToggleListItemChip = ({ type, types, onClick }) => {
    const styles = useStyles();

    const typeObject = types.find(o => o.id === type) || {
        id: type,
        name: type,
    };

    return (
        <Chip className={styles.typeChip} title={typeObject.description} label={typeObject.name} onClick={onClick} />
    );
};

FeatureToggleListItemChip.propTypes = {
    type: PropTypes.string.isRequired,
    types: PropTypes.array,
    onClick: PropTypes.func,
};

export default memo(FeatureToggleListItemChip);
