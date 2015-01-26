var React = require('react');

var TabView = React.createClass({
    getDefaultProps: function() {
        return {tabPanes: []};
    },

    getInitialState: function() {
        var activeTab = this.props.tabPanes[0];

        var userHash = window.location.hash;
        if(userHash) {
            userHash = userHash.split("#")[1];
            this.props.tabPanes.forEach(function(pane) {
                if(pane.slug === userHash) {
                    activeTab = pane;
                }
            }.bind(this));
        }

        return {activeTab: activeTab};
    },

    onChangeTab: function(tabPane) {
        this.setState({activeTab: tabPane});
    },

    render: function() {
        var tabNodes = this.props.tabPanes.map(function (tabPane) {
            return (
                <li key={tabPane.name} className={tabPane.name === this.state.activeTab.name ? "active": ""}>
                    <a  href={"#" + tabPane.slug}
                        onClick={this.onChangeTab.bind(this, tabPane)}>{tabPane.name}
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
                        <div className="mod shadow mrn pan">
                            <div className="inner pan">
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