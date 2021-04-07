import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    List,
    MenuItem,
    Icon,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Button,
    Avatar,
    Typography,
} from '@material-ui/core';
import styles from './common.module.scss';
import ConditionallyRender from './ConditionallyRender/ConditionallyRender';

export { styles };

export const shorten = (str, len = 50) => (str && str.length > len ? `${str.substring(0, len)}...` : str);
export const AppsLinkList = ({ apps }) => (
    <List>
        <ConditionallyRender
            condition={apps.length > 0}
            show={apps.map(({ appName, description, icon }) => (
                <ListItem key={appName} className={styles.listItem}>
                    <ListItemAvatar>
                        <Avatar>
                            <ConditionallyRender
                                key={`avatar_conditional_${appName}`}
                                condition={icon}
                                show={<Icon>{icon}</Icon>}
                                elseShow={<Icon>apps</Icon>}
                            />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Link
                                to={`/applications/${appName}`}
                                className={[styles.listLink, styles.truncate].join(' ')}
                            >
                                {appName}
                            </Link>
                        }
                        secondary={description || 'No description'}
                    />
                </ListItem>
            ))}
        />
    </List>
);
AppsLinkList.propTypes = {
    apps: PropTypes.array.isRequired,
};

export const DataTableHeader = ({ title, actions }) => (
    <div className={styles.dataTableHeader}>
        <div className={styles.title}>
            <Typography variant="h2" className={styles.titleText}>
                {title}
            </Typography>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
    </div>
);
DataTableHeader.propTypes = {
    title: PropTypes.string,
    actions: PropTypes.any,
};

export const FormButtons = ({ submitText = 'Create', onCancel, primaryButtonTestId }) => (
    <div>
        <Button
            data-test={primaryButtonTestId}
            type="submit"
            color="primary"
            variant="contained"
            startIcon={<Icon>add</Icon>}
        >
            {submitText}
        </Button>
        &nbsp;
        <Button type="cancel" onClick={onCancel}>
            Cancel
        </Button>
    </div>
);
FormButtons.propTypes = {
    submitText: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    primaryButtonTestId: PropTypes.string,
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
    <a href={url} target="_blank" rel="noreferrer" className="mdl-color-text--grey-600">
        <Icon>{icon}</Icon>
    </a>
);
IconLink.propTypes = {
    url: PropTypes.string,
    icon: PropTypes.string,
};

export const DropdownButton = ({
    label,
    id,
    className = styles.dropdownButton,
    title,
    icon,
    startIcon,
    style,
    ...rest
}) => (
    <Button
        id={id}
        className={className}
        title={title}
        style={style}
        {...rest}
        startIcon={startIcon}
        endIcon={<Icon>{icon}</Icon>}
    >
        {label}
    </Button>
);

DropdownButton.propTypes = {
    label: PropTypes.string,
    style: PropTypes.object,
    id: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.string,
    startIcon: PropTypes.string,
};

export const MenuItemWithIcon = ({ icon, label, disabled, ...menuItemProps }) => (
    <MenuItem disabled={disabled} style={{ display: 'flex', alignItems: 'center' }} {...menuItemProps}>
        <Icon style={{ paddingRight: '16px' }}>{icon}</Icon>
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

export const selectStyles = {
    control: provided => ({
        ...provided,
        border: '1px solid #607d8b',
        boxShadow: '0',
        ':hover': {
            borderColor: '#607d8b',
            boxShadow: '0 0 0 1px #607d8b',
        },
    }),
};
