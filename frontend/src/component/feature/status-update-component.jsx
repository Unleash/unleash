import React from 'react';
import { Menu, MenuItem } from 'react-mdl';
import { DropdownButton } from '../common';
import PropTypes from 'prop-types';

export default function StatusUpdateComponent({ stale, updateStale }) {
    function setStatus(field) {
        if (field === 'active') {
            updateStale(false);
        } else {
            updateStale(true);
        }
    }

    return (
        <span>
            <DropdownButton className="mdl-button" id="update_status" label="Status" />
            <Menu
                target="update_status"
                onClick={e => setStatus(e.target.getAttribute('data-target'))}
                style={{ width: '168px' }}
            >
                <MenuItem disabled={!stale} data-target="active">
                    Set toggle Active
                </MenuItem>
                <MenuItem disabled={stale} data-target="stale">
                    Mark toggle as Stale
                </MenuItem>
            </Menu>
        </span>
    );
}

StatusUpdateComponent.propTypes = {
    stale: PropTypes.bool.isRequired,
    updateStale: PropTypes.func.isRequired,
};
