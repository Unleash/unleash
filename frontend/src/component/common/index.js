const React = require('react');
const {
    List, ListItem, ListItemContent,
    Grid, Cell,
    Button, Icon,
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
    <Grid style={{ borderBottom: '1px solid #f1f1f1', marginBottom: '10px' }}>
        <Cell col={6}>
            <h4 className="mdl-typography--subhead">{title}</h4>
            {subtitle && <small>{subtitle}</small>}
        </Cell>
        <Cell col={6} style={{ textAlign: 'right' }}>{actions}</Cell>
    </Grid>
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
