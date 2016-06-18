'use strict';
const React = require('react');
const UserStore = require('../stores/UserStore');

const User = React.createClass({

  onSave() {
    const value = this.refs.username.getDOMNode().value.trim();
    UserStore.set(value);
  },

  render() {
    return (
      <div className="r-pvm">
        <input type="text" placeholder="username"
          ref="username"
          defaultValue={UserStore.get()}
          onBlur={this.onSave} />
      </div>
    );
  }
});

module.exports = User;
