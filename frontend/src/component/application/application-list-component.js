import React, { Component } from 'react';
import { ProgressBar } from 'react-mdl';
import { AppsLinkList, HeaderTitle } from '../common';

class ClientStrategies extends Component {

    componentDidMount () {
        this.props.fetchAll();
    }

    render () {
        const {
            applications,
        } = this.props;

        if (!applications) {
            return <ProgressBar indeterminate />;
        }
        return (
            <div>
                <HeaderTitle title="Applications" />
                <AppsLinkList apps={applications} />
            </div>
        );
    }
}


export default ClientStrategies;
