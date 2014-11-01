var React          = require('react');

var CreateStrategy = React.createClass({

    getInitialState: function() {
        return {
            parameters: []
        };
    },


    onSubmit: function(event) {
        event.preventDefault();
        console.log(event);
    },

    handleAddParam: function(event) {
        event.preventDefault();
        var id = this.state.parameters.length + 1;
        var params = this.state.parameters.concat([{id:id, name: "param_" + id, label: "Parameter " +id}]);
        this.setState({parameters: params});
    },

    render: function() {
        var parameters = (this.state.parameters.map(function(param) {
            return <div className="formelement">
                <label className="t4">{param.label}</label>
                <div className="input">
                    <input type="text" name={param.name} />
                </div>
            </div>
        }));

        return (
            <div className="line pam bg-blue-xlt">
                <div className="unit r-size1of2">
                    <form onSubmit={this.onSubmit}>
                        <fieldset>
                            <legend>Create strategy</legend>
                            <div className="formelement">
                                <label for="strategy_name" className="t4">Name</label>
                                <div className="input">
                                    <input id="trategy_name" type="text" name="name" />
                                </div>
                            </div>

                            {parameters}

                            <div className="formelement">
                                <a href="#add" onClick={this.handleAddParam}>+ Add required parameter</a>
                            </div>
                            <div className="actions">
                                <input type="submit" value="Save" className="primary mrs" />
                                <button onClick={this.props.handleCancelNewStrategy}>Cancel</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
});

module.exports = CreateStrategy;