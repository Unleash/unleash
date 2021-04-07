import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from '@material-ui/core';
import { DropdownButton } from '.';

import styles from './common.module.scss';

const DropdownMenu = ({ renderOptions, id, title, callback, icon = 'arrow_drop_down', label, startIcon, ...rest }) => {
    const [anchor, setAnchor] = React.useState(null);

    const handleOpen = e => setAnchor(e.currentTarget);

    const handleClose = e => {
        if (callback && typeof callback === 'function') {
            callback(e);
        }

        setAnchor(null);
    };

    return (
        <>
            <DropdownButton
                id={id}
                label={label}
                title={title}
                startIcon={startIcon}
                onClick={handleOpen}
                aria-controls={id}
                aria-haspopup="true"
                icon={icon}
                {...rest}
            />
            <Menu
                id={id}
                className={styles.dropdownMenu}
                onClick={handleClose}
                anchorEl={anchor}
                open={Boolean(anchor)}
            >
                {renderOptions()}
            </Menu>
        </>
    );
};

DropdownMenu.propTypes = {
    renderOptions: PropTypes.func,
    id: PropTypes.string,
    title: PropTypes.string,
    callback: PropTypes.func,
    icon: PropTypes.string,
    label: PropTypes.string,
    startIcon: PropTypes.object,
};

export default DropdownMenu;
