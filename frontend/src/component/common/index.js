const React = require('react');
import styles from './common.scss';


const {
    List, ListItem, ListItemContent,
    Button, Icon,
    Switch,
} = require('react-mdl');
const { Link } = require('react-router');

export const shorten = (str, len = 50) => (str && str.length > len ? `${str.substring(0, len)}...` : str);

export const AppsLinkList = ({ apps }) => (
    <List style={{ textAlign: 'left' }}>
    {apps.length > 0 && apps.map(({ appName, description = '-', icon = 'apps' }) => (
        <ListItem twoLine key={appName}>
            <ListItemContent avatar={icon} subtitle={shorten(description)}>
                <Link key={appName} to={`/applications/${appName}`}>
                    {appName}
                </Link>
            </ListItemContent>
        </ListItem>
    ))}
    </List>
);

export const HeaderTitle = ({ title, actions, subtitle }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #f1f1f1', marginBottom: '10px', padding: '16px 20px ' }}>
            <div style={{ flex: '2' }}>
                <h6 style={{ margin: 0 }}>{title}</h6>
                {subtitle && <small>{subtitle}</small>}
            </div>

            {actions && <div style={{ flex: '1', textAlign: 'right' }}>{actions}</div>}
    </div>
);

export const FormButtons = ({ submitText = 'Create', onCancel }) => (
    <div>
        <Button type="submit" ripple raised primary icon="add">
            <Icon name="add" />&nbsp;&nbsp;&nbsp;
            { submitText }
        </Button>
        &nbsp;
        <Button type="cancel" ripple raised onClick={onCancel} style={{ float: 'right' }}>
            <Icon name="cancel" />&nbsp;&nbsp;&nbsp;
            Cancel
        </Button>
    </div>
);

export const SwitchWithLabel = ({ onChange, children, checked }) => (
    <span>
        <span style={{ cursor: 'pointer', display: 'inline-block', width: '45px' }}>
            <Switch onChange={onChange} checked={checked} />
        </span>
        <span>{children}</span>
    </span>
);

export const TogglesLinkList = ({ toggles }) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
    {toggles.length > 0 && toggles.map(({ name, description = '-', icon = 'toggle' }) => (
        <ListItem twoLine key={name}>
            <ListItemContent avatar={icon} subtitle={description}>
                <Link key={name} to={`/features/edit/${name}`}>
                    {name}
                </Link>
            </ListItemContent>
        </ListItem>
    ))}
    </List>
);

export function getIcon (type) {
    switch (type) {
        case 'feature-updated': return 'autorenew';
        case 'feature-created': return 'add';
        case 'feature-deleted': return 'remove';
        case 'feature-archived': return 'archived';
        default: return 'star';
    }
};


export const IconLink = ({ icon, children, ...props }) => (
    <a {...props} style={{ textDecoration: 'none' }}>
         <Icon name={icon} style={{ marginRight: '5px', verticalAlign: 'middle' }}/>
         <span style={{ textDecoration: 'none', verticalAlign: 'middle' }}>{children}</span>
    </a>
);

export const ExternalIconLink = ({ url, children }) => (
    <IconLink icon="queue" href={url} target="_blank" rel="noopener">
        {children}
    </IconLink>
);

const badNumbers = [NaN, Infinity, -Infinity];
export function calc (value, total, decimal) {
    if (typeof value !== 'number' ||
        typeof total !== 'number' ||
        typeof decimal !== 'number') {
        return null;
    }

    if (total === 0) {
        return 0;
    }

    badNumbers.forEach((number) => {
        if ([value, total, decimal].indexOf(number) > -1) {
            return number;
        }
    });

    return (value / total * 100).toFixed(decimal);
};
