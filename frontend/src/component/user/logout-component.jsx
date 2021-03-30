import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import { styles as commonStyles } from '../common';

export default class FeatureListComponent extends React.Component {
    static propTypes = {
        logoutUser: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.logoutUser();
    }

    render() {
        return (
            <Card shadow={0} className={commonStyles.fullwidth}>
                <CardHeader>Logged out</CardHeader>
                <CardContent>
                    You have now been successfully logged out of Unleash. Thank you for using Unleash.{' '}
                </CardContent>
            </Card>
        );
    }
}
