var React = require('react');
var UserStore = require('../stores/UserStore');

var User = React.createClass({

  onSave: function() {
    var value = this.refs.username.getDOMNode().value.trim();
    UserStore.set(value);
  },

  render: function() {
    return (
      <div className="r-pam">
        <input type="text" placeholder="username"
          ref="username"
          defaultValue={UserStore.get()}
          onBlur={this.onSave} />
      </div>
    );
  }
});

module.exports = User;
