const React = require('react');
const { List, ListItem, ListItemContent } = require('react-mdl');
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

