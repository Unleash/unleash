import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, IconButton } from 'react-mdl';

class AddStrategy extends React.Component {
    static propTypes = {
        strategies: PropTypes.array.isRequired,
        addStrategy: PropTypes.func,
        fetchStrategies: PropTypes.func.isRequired,
    };

    addStrategy(strategyName) {
        const selectedStrategy = this.props.strategies.find(s => s.name === strategyName);
        const parameters = {};

        selectedStrategy.parameters.forEach(({ name }) => {
            parameters[name] = '';
        });

        this.props.addStrategy({
            name: selectedStrategy.name,
            parameters,
        });
    }

    stopPropagation(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        const menuStyle = {
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'rgb(247, 248, 255)',
        };
        return (
            <div style={{ position: 'relative', width: '25px', height: '25px', display: 'inline-block' }}>
                <IconButton
                    name="add"
                    id="strategies-add"
                    raised
                    accent
                    title="Add Strategy"
                    onClick={this.stopPropagation}
                />
                <Menu target="strategies-add" valign="bottom" align="right" ripple style={menuStyle}>
                    <MenuItem disabled>Add Strategy:</MenuItem>
                    {this.props.strategies.map(s => (
                        <MenuItem key={s.name} title={s.description} onClick={() => this.addStrategy(s.name)}>
                            {s.name}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        );
    }
}

export default AddStrategy;
