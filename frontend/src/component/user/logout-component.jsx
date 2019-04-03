import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText, CardTitle } from 'react-mdl';
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
                <CardTitle>Logged out</CardTitle>
                <CardText>You have now been successfully logged out of Unleash. Thank you for using Unleash. </CardText>
            </Card>
        );
    }
}
