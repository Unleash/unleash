/** @jsx React.DOM */
/* jshint quotmark:false */

// Unleash
//   - Menu
//   - FeatureList
//       - UnsavedFeature
//       - SavedFeature
//

var Menu = React.createClass({
    render: function() { return (
            <nav className='navbar navbar-default' role='navigation'>
                <div className='container'>
                    <a className='navbar-brand' href='#'>Unleash</a>
                </div>
            </nav>
        );
    }
});


var UnsavedFeature = React.createClass({
    render: function() {
        return (
          <div className="bg-info new-feature-form">
            <form className="form-inline" role="form" ref="form">
              <div className="form-group">
                <label className="sr-only" htmlFor="name">Name</label>
                <input
                   type="text"
                   className="form-control input-large"
                   id="name"
                   ref="name"
                   defaultValue={this.props.feature.name}
                   placeholder="Enter name" />
              </div>

              <div className="form-group">
                <div className="input-group">
                  <input className="form-control"
                         type="text"
                         ref="description"
                         placeholder="Enter description" />
                </div>
              </div>

              <div className="form-group">
                <label className="sr-only" htmlFor="strategy">Strategy</label>
                <select id="strategy" ref="strategy"
                        className="input-large" defaultValue={this.props.feature.strategy}>
                  <option value="default">default</option>
                </select>
              </div>

              <div className="checkbox">
                <label>
                  Enabled
                  <input ref="enabled" type="checkbox" defaultValue={this.props.feature.enabled} />
                </label>
              </div>

              <button type="submit" className="btn btn-primary pull-right" onClick={this.saveFeature}>
                Save
              </button>
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
    }
});

var SavedFeature = React.createClass({
    onChange: function(event) {
        this.props.onChange({
            name: this.props.feature.name,
            field: 'enabled',
            value: event.target.checked
        });
    },

    render: function() {
        return (
            <div className='row'>
                <div className='col-xs-1 col-sm-1 col-md-1 col-lg-1'>
                    <input
                        type='checkbox'
                        className='pull-right'
                        checked={this.props.feature.enabled}
                        onChange={this.onChange} />
                </div>
                <div
                    className='col-xs-4 col-sm-4 col-md-4 col-lg-4'
                    title='{this.props.feature.description}'>{this.props.feature.name}</div>
                <div className='pull-right col-xs-2 col-sm-2 col-md-2 col-lg-2'>
                    {this.props.feature.strategy}
                </div>
            </div>
        );
    }
});

var FeatureList = React.createClass({
    render: function() {
        var featureNodes = [];

        this.props.unsavedFeatures.forEach(function(feature, idx) {
            var key = 'new-' + idx;
            featureNodes.push(
                <UnsavedFeature
                  key={key}
                  feature={feature}
                  onSubmit={this.props.onFeatureSubmit} />
            );
        }.bind(this));

        this.props.savedFeatures.forEach(function(feature) {
            featureNodes.push(
                <SavedFeature
                  key={feature.name}
                  feature={feature}
                  onChange={this.props.onFeatureChanged} />
            );
        }.bind(this));

        return (
            <div className="container-fluid">
              <div className='panel panel-primary'>
                  <div className='panel-heading'>
                      <h3 className='panel-title'>Features</h3>
                      <div className='text-right'>
                          <button type="button"
                                  className="btn btn-success btn-sm"
                                  onClick={this.props.onNewFeature}>
                              <span className="glyphicon glyphicon-plus"></span> New
                          </button>
                      </div>
                  </div>

                  <div className='panel-body'>
                    {featureNodes}
                  </div>
                </div>
            </div>
        );
    }
});

var ErrorMessages = React.createClass({

    render: function() {
        if (!this.props.errors.length) {
            return <div/>;
        }

        var errorNodes = this.props.errors.map(function(e) {
            return (<li key={e}>{e}</li>);
        });

        return (
            <div className="alert alert-danger" role="alert">
              <ul>{errorNodes}</ul>
            </div>
        );
    }
});

var Unleash = React.createClass({
    getInitialState: function() {
        return {
            savedFeatures: [],
            unsavedFeatures: [],
            errors: []
        };
    },

    componentDidMount: function () {
        this.loadFeaturesFromServer();
        setInterval(this.loadFeaturesFromServer, this.props.pollInterval);
    },

    loadFeaturesFromServer: function () {
        reqwest('features').then(this.setFeatures, this.handleError);
    },

    setFeatures: function (data) {
        this.setState({savedFeatures: data.features});
    },

    handleError: function (error) {
        this.state.errors.push(error);
    },

    updateFeature: function (changeRequest) {
        var newFeatures = this.state.savedFeatures;
        newFeatures.forEach(function(f){
            if(f.name === changeRequest.name) {
                f[changeRequest.field] = changeRequest.value;
            }
        });

        this.setState({features: newFeatures});

        reqwest({
            url: 'features/' + changeRequest.name,
            method: 'patch',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(changeRequest)
        }).then(function() {
        }, this.handleError);
    },

    createFeature: function (feature) {
        var unsaved = [], state = this.state;

        this.state.unsavedFeatures.forEach(function(f) {
            // TODO: make sure we don't overwrite an existing feature
            if (f.name === feature.name) {
                state.savedFeatures.unshift(f);
            } else {
                unsaved.push(f);
            }
        });

        this.setState({unsavedFeatures: unsaved});

        reqwest({
            url: 'features',
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(feature)
        }).then(function(r) {
            console.log(r);
        }.bind(this), this.handleError);
    },

    newFeature: function() {
        var blankFeature = {
            name: '',
            enabled: false,
            strategy: 'default',
            parameters: {}
        };

        this.state.unsavedFeatures.push(blankFeature);
        this.forceUpdate();
    },

    render: function() {
        return (
            <div>
                <Menu />
                <ErrorMessages errors={this.state.errors} />
                <FeatureList
                    unsavedFeatures={this.state.unsavedFeatures}
                    savedFeatures={this.state.savedFeatures}
                    onFeatureChanged={this.updateFeature}
                    onFeatureSubmit={this.createFeature}
                    onNewFeature={this.newFeature}
                />
            </div>
        );
    }
});


React.renderComponent(
    <Unleash pollInterval={5000} />,
    document.getElementById('content')
);