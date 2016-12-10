const React = require('react');
const {
    List, ListItem, ListItemContent,
    Grid, Cell,
    Button, Icon,
    Switch,
} = require('react-mdl');
const { Link } = require('react-router');

export const AppsLinkList = ({ apps }) => (
    <List style={{ textAlign: 'left' }}>
    {apps.length > 0 && apps.map(({ appName, description = '-', icon = 'apps' }) => (
        <ListItem twoLine key={appName}>
            <ListItemContent avatar={icon} subtitle={description}>
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
            <div style={{ flex: '1' }}>
                <h6 style={{ margin: 0 }}>{title}</h6>
                {subtitle && <small>{subtitle}</small>}
            </div>

            <div style={{ flex: '1', textAlign: 'right' }}>
                {actions}
            </div>
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
    <List style={{ textAlign: 'left' }}>
    {toggles.length > 0 && toggles.map(({ name, description = '-', icon = 'toggle' }) => (
        <ListItem twoLine key={name}>
            <ListItemContent avatar={icon} subtitle={description}>
                <Link key={name} to={`/features/edit//${name}`}>
                    {name}
                </Link>
            </ListItemContent>
        </ListItem>
    ))}
    </List>
);
