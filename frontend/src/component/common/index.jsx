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
} from '@mui/material';
import Apps from '@mui/icons-material/Apps';

import styles from './common.module.scss';
import { ConditionallyRender } from './ConditionallyRender/ConditionallyRender.tsx';

export { styles };

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
                                elseShow={<Apps />}
                            />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Link
                                to={`/applications/${encodeURIComponent(
                                    appName,
                                )}`}
                                className={[
                                    styles.listLink,
                                    styles.truncate,
                                ].join(' ')}
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
            <Typography variant='h2' className={styles.titleText}>
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

export const FormButtons = ({
    submitText = 'Create',
    onCancel,
    primaryButtonTestId,
}) => (
    <div>
        <Button
            data-testid={primaryButtonTestId}
            type='submit'
            color='primary'
            variant='contained'
        >
            {submitText}
        </Button>
        &nbsp;
        <Button type='cancel' onClick={onCancel}>
            Cancel
        </Button>
    </div>
);
FormButtons.propTypes = {
    submitText: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    primaryButtonTestId: PropTypes.string,
};

export const IconLink = ({ url, icon: IconComponent }) => (
    <a
        href={url}
        target='_blank'
        rel='noreferrer'
        className='mdl-color-text--grey-600'
    >
        <IconComponent />
    </a>
);
IconLink.propTypes = {
    url: PropTypes.string,
    icon: PropTypes.object,
};

export const MenuItemWithIcon = React.forwardRef(
    ({ icon: IconComponent, label, disabled, ...menuItemProps }, _ref) => (
        <MenuItem
            disabled={disabled}
            style={{ display: 'flex', alignItems: 'center' }}
            {...menuItemProps}
        >
            <IconComponent />
            {label}
        </MenuItem>
    ),
);
MenuItemWithIcon.propTypes = {
    icon: PropTypes.object,
    label: PropTypes.string,
    disabled: PropTypes.bool,
};
