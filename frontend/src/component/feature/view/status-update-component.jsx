import React from 'react';
import { MenuItem } from '@material-ui/core';
import DropdownMenu from '../../common/DropdownMenu/DropdownMenu';
import PropTypes from 'prop-types';

export default function StatusUpdateComponent({ stale, updateStale }) {
    function setStatus(field) {
        if (field === 'active') {
            updateStale(false);
        } else if (field === 'stale') {
            updateStale(true);
        }
    }

    const renderOptions = () => [
        <MenuItem disabled={!stale} key="status_update_0" data-target="active">
            Set toggle Active
        </MenuItem>,
        <MenuItem disabled={stale} key="status_update_1" data-target="stale">
            Mark toggle as Stale
        </MenuItem>,
    ];

    const onClick = e => {
        setStatus(e.target.getAttribute('data-target'));
    };

    return (
        <DropdownMenu
            callback={onClick}
            renderOptions={renderOptions}
            id="feature-stale-dropdown"
            label={stale ? 'STALE' : 'ACTIVE'}
            style={{ fontWeight: 'bold' }}
        />
    );
}

StatusUpdateComponent.propTypes = {
    stale: PropTypes.bool.isRequired,
    updateStale: PropTypes.func.isRequired,
};
