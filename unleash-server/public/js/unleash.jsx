/** @jsx React.DOM */
/* jshint quotmark:false */

// Unleash
//   - Menu
//   - FeatureList
//       - UnsavedFeature
//       - SavedFeature
//

var Timer = function(cb, interval) {
    this.cb = cb;
    this.interval = interval;
    this.timerId = null;
};

Timer.prototype.start = function() {
    if (this.timerId != null) {
        console.warn("timer already started");
    }

    console.log('starting timer');
    this.timerId = setInterval(this.cb, this.interval);
};

Timer.prototype.stop  = function() {
    if (this.timerId == null) {
        console.warn('no timer running');
    } else {
        console.log('stopping timer');
        clearInterval(this.timerId);
        this.timerId = null;
    }
};

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
                <div className='col-md-1 text-right'>
                    <input
                        type='checkbox'
                        checked={this.props.feature.enabled}
                        onChange={this.onChange} />
                </div>
                <div
                    className='col-md-4'
                    title='{this.props.feature.description}'>{this.props.feature.name}</div>
                <div className='col-md-2 col-md-offset-5'>
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
                  onSubmit={this.props.onFeatureSubmit}
                  onCancel={this.props.onFeatureCancel} />
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
            <div className="container">
              <div className='panel panel-primary'>
                  <div className='panel-heading'>
                      <h3 className='panel-title'>Features</h3>
                      <div className='text-right'>
                          <button type="button"
                                  className="btn btn-default btn-sm"
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
            errors: [],
            poller: null
        };
    },

    componentDidMount: function () {
        this.loadFeaturesFromServer();
        this.state.timer = new Timer(this.loadFeaturesFromServer, this.props.pollInterval);
        this.state.timer.start();
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
        this.state.timer.stop();

        reqwest({
            url: 'features/' + changeRequest.name,
            method: 'patch',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(changeRequest)
        }).then(function() {
            // all good
            this.state.timer.start();
        }.bind(this), this.handleError);
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

    cancelNewFeature: function (feature) {
        var unsaved = [];

        this.state.unsavedFeatures.forEach(function (f) {
            if (f.name !== feature.name) {
                unsaved.push(f);
            }
        });

        this.setState({unsavedFeatures: unsaved});
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
                    onFeatureCancel={this.cancelNewFeature}
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