import React, { Component } from 'react';
import { List, ListItem, ListItemContent } from 'react-mdl';
import { Link } from 'react-router';

class ClientStrategies extends Component {

    componentDidMount () {
        this.props.fetchAll();
    }

    render () {
        const {
            applications,
        } = this.props;

        if (!applications) {
            return <div>loading...</div>;
        }
        return (
            <div>
                <h5>Applications</h5>
                <hr />
                <List>
                {applications.map(({ appName, data = {} }) => (
                    <ListItem key={appName} twoLine>
                        <ListItemContent avatar={data.icon || 'apps'} subtitle={data.description}>
                            <Link to={`/applications/${appName}`}>
                                {appName}
                            </Link>
                        </ListItemContent>
                    </ListItem>
                ))}
                </List>
            </div>
        );
    }
}


export default ClientStrategies;
