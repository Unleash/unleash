import React from 'react';
import { Chip } from 'react-mdl';
import PropTypes from 'prop-types';

export default function StatusComponent({ stale, style, showActive = true }) {
    if (!stale && !showActive) {
        return null;
    }

    const className = stale
        ? 'mdl-color--red mdl-color-text--white mdl-shadow--2dp'
        : 'mdl-color--light-green-500 mdl-color-text--white mdl-shadow--2dp';

    const title = stale ? 'Feature toggle is deprecated.' : 'Feature toggle is active.';
    const value = stale ? 'Stale' : 'Active';

    return (
        <Chip style={style} title={title} className={className}>
            {value}
        </Chip>
    );
}

StatusComponent.propTypes = {
    stale: PropTypes.bool.isRequired,
    style: PropTypes.object,
    showActive: PropTypes.bool,
};
