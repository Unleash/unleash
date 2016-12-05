import React, { Component } from 'react';
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
                {applications.map(item => (
                    <Link key={item.appName} to={`/applications/${item.appName}`}>
                        Link: {item.appName}
                    </Link>
                ))}
            </div>
        );
    }
}


export default ClientStrategies;
