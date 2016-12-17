import React, { PropTypes } from 'react';
import { Menu, MenuItem, IconButton }  from 'react-mdl';


const StaticMenu = ({ icon = 'add', title, onClick, items }) => (
    <div className=".mdl-menu__container is-visible">
        trigger:
        <IconButton name={icon} title={title} onClick={(e) => {
            e.preventDefault();
        }} />
        <ul className="mdl-menu mdl-menu--bottom-right">
            {items.map(name => <li className="mdl-menu__item" key={name} onClick={(e) => {
                e.preventDefault();
                onClick(name);
            }}>{name}</li>)}
        </ul>
    </div>
);

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
        const menuStyle = {
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'rgb(247, 248, 255)',
        };
        return (
            <div style={{ position: 'relative', width: '25px', height: '25px', display: 'inline-block' }} >

                <StaticMenu
                    title="Add Strategy"
                    icon="add"
                    // trigger={<IconButton name="add" id="strategies-add" raised accent title="Add Strategy" onClick={this.stopPropagation}/>}
                    onClick={(name) => this.addStrategy(name)}
                    items={this.props.strategies.map(s => s.name)}
                />


            </div>
        );
    }
}


export default AddStrategy;
