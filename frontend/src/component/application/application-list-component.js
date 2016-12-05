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
                <ul>
                {applications.map(item => (
                    <li>
                        <Link key={item.appName} to={`/applications/${item.appName}`}>
                            Link: {item.appName}
                        </Link>
                    </li>
                ))}
                </ul>
            </div>
        );
    }
}


export default ClientStrategies;
