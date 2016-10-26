import React, { PropTypes } from 'react';
import StrategiesList from './strategies-list';
import AddStrategy from './strategies-add';

const headerStyle = {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    paddingBottom: '5px',
    marginBottom: '10px',
};

class StrategiesSection extends React.Component {

    static propTypes () {
        return {
            strategies: PropTypes.array.isRequired,
            addStrategy: PropTypes.func.isRequired,
            removeStrategy: PropTypes.func.isRequired,
            updateStrategy: PropTypes.func.isRequired,
            fetchStrategies: PropTypes.func.isRequired,
        };
    }

    componentWillMount () {
        this.props.fetchStrategies();
    }

    render () {
        if (!this.props.strategies || this.props.strategies.length === 0) {
            return <i>Loding available strategies</i>;
        }

        return (
            <div>
                 <div>
                    <h5 style={headerStyle}>Strategies:</h5>
                    <StrategiesList {...this.props} />
                    <AddStrategy {...this.props} />
                </div>
            </div>
        );
    }
}

export default StrategiesSection;
