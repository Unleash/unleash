var React = require('react');

var TabView = React.createClass({
    getDefaultProps: function() {
        return {tabPanes: []};
    },

    getInitialState: function() {
        return {activeTab: this.props.tabPanes[0]};
    },

    handleChangeTab: function(tabPane) {
        this.setState({activeTab: tabPane});
    },

    render: function() {
        var tabNodes = this.props.tabPanes.map(function (tabPane) {
            return (
                <li  key={tabPane.name} className={tabPane.name===this.state.activeTab.name ? "active": ""}>
                    <a  href={"#" + tabPane.name}
                        onClick={this.handleChangeTab.bind(this, tabPane)}>{tabPane.name}
                    </a>
                </li>
            );
        }.bind(this));

        return (
            <div>
                <ul className="tabs mbn">
                    {tabNodes}
                </ul>
                <div className="tab-content">
                    <div className="active">
                        <div className="mod shadow mrn prn">
                            <div className="inner">
                                <div className="bd">
                                    {this.state.activeTab.content}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
    }
});

module.exports = TabView;