import React, { PropTypes } from 'react';
import { Button, Dropdown } from 'react-toolbox';

class AddStrategy extends React.Component {

    static propTypes () {
        return {
            strategies: PropTypes.array.isRequired,
            addStrategy: PropTypes.func.isRequired,
            fetchStrategies: PropTypes.func.isRequired,
        };
    }

    addStrategy = (strategyName) => {
        const selectedStrategy = this.props.strategies.find(s => s.name === strategyName);
        const parameters = {};
        const keys = Object.keys(selectedStrategy.parametersTemplate || {});
        keys.forEach(prop => { parameters[prop] = ''; });


        this.props.addStrategy({
            name: selectedStrategy.name,
            parameters,
        });
    };

    customItem (item) {
        const containerStyle = {
            display: 'flex',
            flexDirection: 'row',
        };


        const contentStyle = {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 2,
        };

        return (
        <div style={containerStyle}>
            <div style={contentStyle}>
            <strong>{item.name}</strong>
            <small>{item.description}</small>
            </div>
        </div>
        );
    }

    render () {
        const strats = this.props.strategies.map(s => {
            s.value = s.name;
            return s;
        });

        return (
            <div>
                <Dropdown
                    auto={false}
                    source={strats}
                    onChange={this.addStrategy}
                    label="Select activation strategy to add"
                    template={this.customItem}
                />
            </div>
        );
    }
}


export default AddStrategy;
