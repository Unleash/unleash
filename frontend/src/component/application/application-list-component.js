import React, { Component } from 'react';
import { ProgressBar, Card } from 'react-mdl';
import { AppsLinkList, styles as commonStyles } from '../common';

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
            <Card className={commonStyles.fullwidth}>
                <AppsLinkList apps={applications} />
            </Card>
        );
    }
}


export default ClientStrategies;
