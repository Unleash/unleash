var React          = require('react');
var TextInput      = require('../form/TextInput');

var StrategyForm = React.createClass({

    getDefaultProps: function() {
        return {
            maxParams: 4
        };
    },

    getInitialState: function() {
        return {
            parameters: []
        };
    },

    onSubmit: function(event) {
        event.preventDefault();

        var strategy = {};
        strategy.name = this.refs.name.getValue();
        strategy.description = this.refs.description.getValue();
        strategy.parametersTemplate = {};

        var that = this;

        this.state.parameters.forEach(function(parameter) {
           var name = that.refs[parameter.name].getDOMNode().value.trim();
            if(name) {
                strategy.parametersTemplate[name] = "string";
            }
        });

        this.props.onSave(strategy);
    },

    onAddParam: function(event) {
        event.preventDefault();
        var id = this.state.parameters.length + 1;
        var params = this.state.parameters.concat([{id:id, name: "param_" + id, label: "Parameter " +id}]);
        this.setState({parameters: params});
    },

    onRemoveParam: function(event) {
        event.preventDefault();
        var id = this.state.parameters.length + 1;
        var params = this.state.parameters.slice(0, -1);

        this.setState({parameters: params});
    },

    render: function() {
        return (
            <div className="line pam bg-blue-xlt">
                <div className="unit r-size1of2">
                    <form onSubmit={this.onSubmit}>
                        <fieldset>
                            <legend>Create strategy</legend>

                            <TextInput
                                id="name"
                                name="name"
                                label="Name"
                                ref="name"
                                placeholder="Strategy name" />

                            <TextInput
                                id="description"
                                name="description"
                                label="Description"
                                ref="description"
                                placeholder="Please write a short descriptio" />

                            {this.renderParameters()}
                            {this.renderRemoveLink()}

                            <div className="actions">
                                <input type="submit" value="Save" className="primary mrs" />
                                <button onClick={this.props.handleCancelNewStrategy} className="mrs">Cancel</button>
                                {this.renderAddLink()}
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    },

    renderParameters: function() {
        return this.state.parameters.map(function(param) {
            return (
                <div className="formelement" key={param.name}>
                    <label className="t4">{param.label}</label>
                    <div className="input">
                        <div className="line">

                            <div className="unit size2of3">
                                <input
                                    type="text"
                                    name={param.name}
                                    ref={param.name}
                                    placeholder="Parameter name"
                                />
                            </div>

                            <div className="unit size1of3">
                                <select defaultValue="string">
                                    <option value="string">string</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                )
        });
    },

    renderAddLink: function() {
        if(this.state.parameters.length < this.props.maxParams) {
            return <a href="#add" onClick={this.onAddParam}>+ Add required parameter</a>;
        }
    },
    renderRemoveLink: function() {
        if(this.state.parameters.length > 0) {
            return (
                <div className="formelement mtn">
                    <a href="#add" className="negative" onClick={this.onRemoveParam}>- Remove parameter</a>
                </div>
                );
        }
    }
});

module.exports = StrategyForm;