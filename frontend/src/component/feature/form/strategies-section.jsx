import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-mdl';
import StrategiesList from './strategies-list';
import AddStrategy from './strategies-add';
import { HeaderTitle } from '../../common';

class StrategiesSectionComponent extends React.Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        featureToggleName: PropTypes.string,
        addStrategy: PropTypes.func,
        removeStrategy: PropTypes.func,
        updateStrategy: PropTypes.func,
        fetchStrategies: PropTypes.func,
    };

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
        this.props.fetchStrategies();
    }

    render() {
        if (!this.props.strategies || this.props.strategies.length === 0) {
            return <ProgressBar indeterminate />;
        }

        return (
            <div style={{ padding: '10px 0' }}>
                {this.props.addStrategy ? (
                    <HeaderTitle title="Activation strategies" actions={<AddStrategy {...this.props} />} />
                ) : (
                    <span />
                )}
                <StrategiesList {...this.props} />
            </div>
        );
    }
}

export default StrategiesSectionComponent;
