var React          = require('react');

var CreateStrategy = React.createClass({

    render: function() {
        return (
            <div className="line pam mhl bg-blue-xlt">
                <div className="unit r-size1of2">
                    <form>
                        <fieldset>
                            <legend>New strategy</legend>
                            <div className="formelement">
                                <label for="strategy_name" className="t4">Name</label>
                                <div class="input">
                                    <input id="trategy_name" type="text" name="name" />
                                </div>
                            </div>
                            <div className="formelement">
                                <a href="#add">+ Add required parameter</a>
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