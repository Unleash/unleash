import React, { Component } from 'react';
import { ProgressBar, Grid, Cell } from 'react-mdl';
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
            <Grid className="mdl-color--white">
                <Cell col={12}>
                    <HeaderTitle title="Applications" />
                    <AppsLinkList apps={applications} />
                </Cell>
            </Grid>
        );
    }
}


export default ClientStrategies;
