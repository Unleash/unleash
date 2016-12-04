import React, { PropTypes } from 'react';
// import Dropdown from 'react-toolbox/lib/dropdown';
// TODO use menu
import { Icon }  from 'react-mdl';

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
            marginLeft: '10px',
        };

        return (
        <div style={containerStyle}>
            <Icon value="add" />
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

/*

<Dropdown
                    allowBlank={false}
                    auto
                    source={strats}
                    onChange={this.addStrategy}
                    label="Click to add activation strategy"
                    template={this.customItem}
                />
                
*/

        return (
            <div style={{ maxWidth: '400px', marginTop: '20px' }}>
                
            </div>
        );
    }
}


export default AddStrategy;
