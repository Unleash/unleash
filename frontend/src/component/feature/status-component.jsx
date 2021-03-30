import React, { memo } from 'react';
import classnames from 'classnames';
import { Chip } from '@material-ui/core';
import PropTypes from 'prop-types';

import styles from './status.module.scss';
function StatusComponent({ stale, style, showActive = true }) {
    if (!stale && !showActive) {
        return null;
    }

    const className = classnames({
        [styles.stale]: stale,
        [styles.active]: !stale,
    });

    const title = stale ? 'Feature toggle is deprecated.' : 'Feature toggle is active.';
    const value = stale ? 'Stale' : 'Active';

    return <Chip style={style} title={title} className={className} label={value} />;
}

export default memo(StatusComponent);

StatusComponent.propTypes = {
    stale: PropTypes.bool.isRequired,
    style: PropTypes.object,
    showActive: PropTypes.bool,
};
