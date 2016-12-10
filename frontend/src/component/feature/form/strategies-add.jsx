import React, { PropTypes } from 'react';
import { Menu, MenuItem, IconButton }  from 'react-mdl';

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

    stopPropagation (e) {
        e.stopPropagation();
        e.preventDefault();
    }

    render () {
        return (
            <div style={{ position: 'relative', width: '25px', height: '25px', display: 'inline-block' }} >
                <IconButton name="add" id="strategies-add" colored title="Sort" onClick={this.stopPropagation}/>
                <Menu target="strategies-add" valign="bottom" align="right" ripple onClick={
                    (e) => this.setSort(e.target.getAttribute('data-target'))}>
                    <MenuItem disabled>Add Strategy:</MenuItem>
                    {this.props.strategies.map((s) => <MenuItem key={s.name} onClick={() => this.addStrategy(s.name)}>{s.name}</MenuItem>)}
                </Menu>
            </div>
        );
    }
}


export default AddStrategy;
