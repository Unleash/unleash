import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemContent, Button, Icon, Switch, MenuItem } from 'react-mdl';
import styles from './common.scss';

export { styles };

export const shorten = (str, len = 50) => (str && str.length > len ? `${str.substring(0, len)}...` : str);

export const AppsLinkList = ({ apps }) => (
    <List>
        {apps.length > 0 &&
            apps.map(({ appName, description = '-', icon }) => (
                <ListItem twoLine key={appName}>
                    <span className="mdl-list__item-primary-content" style={{ minWidth: 0 }}>
                        <Icon name={icon || 'apps'} className="mdl-list__item-avatar" />
                        <Link to={`/applications/${appName}`} className={[styles.listLink, styles.truncate].join(' ')}>
                            {appName}
                            <span className={['mdl-list__item-sub-title', styles.truncate].join(' ')}>
                                {description}
                            </span>
                        </Link>
                    </span>
                </ListItem>
            ))}
    </List>
);
AppsLinkList.propTypes = {
    apps: PropTypes.array.isRequired,
};

export const HeaderTitle = ({ title, actions, subtitle }) => (
    <div
        style={{
            display: 'flex',
            borderBottom: '1px solid #f1f1f1',
            marginBottom: '10px',
            padding: '16px 20px ',
        }}
    >
        <div style={{ flex: '2' }}>
            <h6 style={{ margin: 0 }}>{title}</h6>
            {subtitle && <small>{subtitle}</small>}
        </div>

        {actions && <div style={{ flex: '1', textAlign: 'right' }}>{actions}</div>}
    </div>
);
HeaderTitle.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    actions: PropTypes.any,
};

export const DataTableHeader = ({ title, actions }) => (
    <div className={styles.dataTableHeader}>
        <div className={styles.title}>
            <h2 className={styles.titleText}>{title}</h2>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
    </div>
);
DataTableHeader.propTypes = {
    title: PropTypes.string,
    actions: PropTypes.any,
};

export const FormButtons = ({ submitText = 'Create', onCancel }) => (
    <div>
        <Button type="submit" ripple raised primary icon="add">
            <Icon name="add" />
            &nbsp;&nbsp;&nbsp;
            {submitText}
        </Button>
        &nbsp;
        <Button type="cancel" ripple raised onClick={onCancel} style={{ float: 'right' }}>
            <Icon name="cancel" />
            &nbsp;&nbsp;&nbsp; Cancel
        </Button>
    </div>
);
FormButtons.propTypes = {
    submitText: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
};

export const SwitchWithLabel = ({ onChange, checked, children, ...switchProps }) => (
    <span className={styles.switchWithLabel}>
        <span className={styles.label}>{children}</span>
        <span className={styles.switch}>
            <Switch checked={checked} onChange={onChange} {...switchProps} />
        </span>
    </span>
);
SwitchWithLabel.propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func,
};

export const TogglesLinkList = ({ toggles }) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
        {toggles.length > 0 &&
            toggles.map(({ name, description = '-', icon = 'toggle' }) => (
                <ListItem twoLine key={name}>
                    <ListItemContent avatar={icon} subtitle={description}>
                        <Link key={name} to={`/features/view/${name}`}>
                            {name}
                        </Link>
                    </ListItemContent>
                </ListItem>
            ))}
    </List>
);
TogglesLinkList.propTypes = {
    toggles: PropTypes.array,
};

export function getIcon(type) {
    switch (type) {
        case 'feature-updated':
            return 'autorenew';
        case 'feature-created':
            return 'add';
        case 'feature-deleted':
            return 'remove';
        case 'feature-archived':
            return 'archived';
        default:
            return 'star';
    }
}

export const IconLink = ({ url, icon }) => (
    <a href={url} target="_blank" rel="noopener" className="mdl-color-text--grey-600">
        <Icon name={icon} />
    </a>
);
IconLink.propTypes = {
    url: PropTypes.string,
    icon: PropTypes.string,
};

export const DropdownButton = ({ label, id }) => (
    <Button id={id} className={styles.dropdownButton}>
        {label}
        <Icon name="arrow_drop_down" className="mdl-color-text--grey-600" />
    </Button>
);
DropdownButton.propTypes = {
    label: PropTypes.string,
    id: PropTypes.string,
};

export const MenuItemWithIcon = ({ icon, label, disabled, ...menuItemProps }) => (
    <MenuItem disabled={disabled} style={{ display: 'flex', alignItems: 'center' }} {...menuItemProps}>
        <Icon name={icon} style={{ paddingRight: '16px' }} />
        {label}
    </MenuItem>
);
MenuItemWithIcon.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool,
};

const badNumbers = [NaN, Infinity, -Infinity];
export function calc(value, total, decimal) {
    if (typeof value !== 'number' || typeof total !== 'number' || typeof decimal !== 'number') {
        return null;
    }

    if (total === 0) {
        return 0;
    }

    badNumbers.forEach(number => {
        if ([value, total, decimal].indexOf(number) > -1) {
            return number;
        }
    });

    return ((value / total) * 100).toFixed(decimal);
}
export function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
