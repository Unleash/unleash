import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-mdl';
import StrategiesList from './strategies-list';
import AddStrategy from './strategies-add';
import { HeaderTitle } from '../../common';

class StrategiesSection extends React.Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        addStrategy: PropTypes.func.isRequired,
        removeStrategy: PropTypes.func.isRequired,
        updateStrategy: PropTypes.func.isRequired,
        fetchStrategies: PropTypes.func.isRequired,
    };

    componentWillMount() {
        this.props.fetchStrategies();
    }

    render() {
        if (!this.props.strategies || this.props.strategies.length === 0) {
            return <ProgressBar indeterminate />;
        }

        return (
            <div>
                <HeaderTitle
                    title="Activation strategies"
                    actions={<AddStrategy {...this.props} />}
                />
                <StrategiesList {...this.props} />
            </div>
        );
    }
}

export default StrategiesSection;
