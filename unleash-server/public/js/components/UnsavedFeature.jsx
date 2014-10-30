var React = require('react');

var UnsavedFeature = React.createClass({
    render: function() {
        return (
          <div className="bg-info new-feature-form row">
            <form className="form-inline" role="form" ref="form">
              <div className="checkbox col-md-1 text-right">
                <input ref="enabled" type="checkbox" defaultValue={this.props.feature.enabled} />
              </div>

              <div className="form-group col-md-4">
                <input
                   type="text"
                   className="form-control"
                   id="name"
                   ref="name"
                   defaultValue={this.props.feature.name}
                   placeholder="Enter name" />

                  <input className="form-control"
                         type="text"
                         ref="description"
                         placeholder="Enter description" />
              </div>

              <div className="form-group col-md-1 col-md-offset-5">
                <select id="strategy"
                        ref="strategy"
                        className=""
                        defaultValue={this.props.feature.strategy}>
                  <option value="default">default</option>
                </select>
              </div>

              <div className="form-group col-md-1">
                <button className="btn btn-primary btn-xs" onClick={this.saveFeature}>
                    Save
                </button>

                <button className="btn btn-xs" onClick={this.cancelFeature}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        );
    },

    saveFeature: function(e) {
        e.preventDefault();

        this.props.feature.name        = this.refs.name.getDOMNode().value;
        this.props.feature.description = this.refs.description.getDOMNode().value;
        this.props.feature.strategy    = this.refs.strategy.getDOMNode().value;
        this.props.feature.enabled     = this.refs.enabled.getDOMNode().checked;

        this.props.onSubmit(this.props.feature);
    },

    cancelFeature: function(e) {
        e.preventDefault();
        this.props.onCancel(this.props.feature);
    }
});

module.exports = UnsavedFeature;