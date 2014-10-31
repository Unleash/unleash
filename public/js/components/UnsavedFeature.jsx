var React = require('react');

var UnsavedFeature = React.createClass({
    render: function() {
        return (
          <form ref="form" className="bg-blue-xlt">
            <div className="line mal ptl pbl">

              <div className="unit prl r-size1of6">
                <input ref="enabled" type="checkbox" defaultValue={this.props.feature.enabled} />
              </div>

              <div className="unit r-size2of5">
                <input
                   type="text"
                   className="mbs"
                   id="name"
                   ref="name"
                   defaultValue={this.props.feature.name}
                   placeholder="Enter name" />

                <input className=""
                   type="text"
                   ref="description"
                   placeholder="Enter description" />
              </div>

              <div className="unit r-size2of6 plm">
                <select id="strategy"
                        ref="strategy"
                        className=""
                        defaultValue={this.props.feature.strategy}>
                  <option value="default">default</option>
                </select>
              </div>

            <div className="unit r-size1of6 rightify">
              <button className="primary mrs" onClick={this.saveFeature}>
                  Save
              </button>

              <button className="" onClick={this.cancelFeature}>
                Cancel
              </button>
            </div>
          </div>
          </form>
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