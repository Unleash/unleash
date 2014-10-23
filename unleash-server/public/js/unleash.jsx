/** @jsx React.DOM */
/* jshint quotmark:false */

//  FeatureListPage
//      Meny
//      FeatureList
//          Feature
//            FeatureViewer
//              - props
//              - button-edit
//              - button-delete
//              - toggle-status
//            FeatureEditor
//              - name
//              - status
//              - description
//
//  NewFeaturePage
//      Meny
//      NewFeatureForm

var FeatureEditor = React.createClass({

    handleSubmit: function(e) {
        e.preventDefault();
        this.props.onSubmit(this.props.feature);
        return;
    },

    render: function () {
        return (
            <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>Edit/new feature</legend>

                    <div className="control-group">
                        <label className="control-label" htmlFor="name">Name</label>
                        <div className="controls">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Superfeature"
                                className="input-large"
                                required=""
                                value={this.props.feature.name} />
                            <p className="help-block">Give the feature a name</p>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label" htmlFor="description">Description</label>
                        <div className="controls">
                            <input
                                id="description"
                                name="description"
                                type="text"
                                placeholder="It does this and that "
                                className="input-large"
                                value={this.props.feature.description} />
                            <p className="help-block">Describe the feature</p>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label" htmlFor="strategy">Strategy</label>
                        <div className="controls">
                            <select
                                id="strategy"
                                className="input-large"
                                value={this.props.feature.strategy}>
                                <option value="Default">Default</option>
                            </select>
                        </div>
                    </div>

                    <div className="control-group">
                        <div className="controls">
                            <input type="submit" value="Save" className="btn btn-success" />
                            <input
                               type="button"
                               value="Cancel"
                               className="btn"
                               onClick={this.props.onToggleMode} />
                        </div>
                    </div>
                </fieldset>

                <hr />
            </form>
        );
    }
});

var FeatureViewer = React.createClass({
    // TODO: validate props?
    handleEnableChange: function(event) {
        var feature = this.props.feature;
        this.props.updateFeature({
            name: feature.name,
            field: 'enabled',
            value: event.target.checked
        });
    },

    render: function () {
        return (
            <div>
              <div className='line'>
                <div className='unit r-size1of3'>
                  <div className='mod'>
                    <div className='inner'>
                       <div className='bd'>
                         <p>{this.props.feature.name}</p>
                         <p className='neutral'>{this.props.feature.description}</p>

                       </div>
                    </div>
                  </div>
                </div>

                <div className='unit r-size1of3'>
                  <div className='mod'>
                    <div className='inner'>
                       <div className='bd'>
                         <p>
                           <label>
                              {this.props.feature.status}
                              <input
                                 type='checkbox'
                                 checked={this.props.feature.enabled}
                                 className='mll'
                                 onChange={this.handleEnableChange}
                              />
                           </label>
                         </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className='unit r-size1of3'>
                  <div className='mod'>
                    <div className='inner'>
                       <div className='bd'>
                         <button className='pam mtl mll' onClick={this.props.onToggleMode}>Edit</button>
                         <button className='pam mtl mll'>Delete</button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr />
            </div>
        );
    }
});

var Feature = React.createClass({
    getInitialState: function() {
        return { mode: 'view', error: '' };
    },

    onToggleMode: function() {
        if (this.isInViewMode()) {
            this.setState({mode: 'edit'});
        } else if (this.isInEditMode()) {
            this.setState({mode: 'view'});
        } else {
            throw "invalid mode: " + this.state.mode;
        }
    },

    onSubmit: function() {
        var isNew = false;
        var cb = function(err) {
            if (err) {
                this.setState({error: err});
            } else {
                this.setState(this.getInitialState());
            }
        };

        if (isNew) {
            this.props.createFeature(this.props.feature, cb.bind(this));
        } else {
            this.props.updateFeature(this.props.feature, cb.bind(this));
        }
    },

    render: function() {
        if (this.isInViewMode()) {
            return (
                <FeatureViewer feature={this.props.feature} onToggleMode={this.onToggleMode} />
            );
        } else if (this.isInEditMode()) {
            return (
                <FeatureEditor feature={this.props.feature} onToggleMode={this.onToggleMode} onSubmit={this.onSubmit} />
            );
        } else {
            throw "invalid mode: " + this.state.mode;
        }
    },

    isInViewMode: function() { return this.state.mode === 'view'; },
    isInEditMode: function() { return this.state.mode === 'edit'; }
});

var FeatureList = React.createClass({
    getInitialState: function() {
        return {
            features: []
        };
    },

    componentDidMount: function () {
        this.loadFeaturesFromServer();
        setInterval(this.loadFeaturesFromServer, this.props.pollInterval);
    },

    loadFeaturesFromServer: function () {
        reqwest('features').then(this.setFeatures);
    },

    setFeatures: function (data) {
        this.setState({features: data.features});
    },

    updateFeature: function (changeRequest, callback) {
        var newFeatures = this.state.features;
        newFeatures.forEach(function(f){
            if(f.name === changeRequest.name) {
                f[changeRequest.field] = changeRequest.value;
            }
        });

        reqwest({
            url: 'features/' + changeRequest.name,
            method: 'patch',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(changeRequest)
        }).then(function() {
            this.setState({features: newFeatures});
            callback();
        }.bind(this), function() {
            callback('update failed');
            window.alert('update failed');
        }.bind(this));
    },

    createFeature: function (feature, callback) {
        reqwest({
            url: 'features',
            method: 'post',
            type: 'json',
            contentType: 'application/json',
            data: JSON.stringify(feature)
        }).then(function() {
            callback();
        }.bind(this), function() {
            callback('create failed');
            window.alert('create failed');
        }.bind(this));
    },

    render: function () {
        var featureNodes = this.state.features.map(function (feature) {
            return (
                <Feature
                  feature={feature}
                  updateFeature={this.updateFeature}
                  createFeature={this.createFeature} />
            );
        }.bind(this));

        return (
            <div className='panel panel-primary'>
                <div className='panel-heading'>
                    <h3 className='panel-title'>Features</h3>
                </div>
                <div className='panel-body'>
                    {featureNodes}
                </div>
            </div>
        );
    }
});

React.renderComponent(
    <FeatureList pollInterval={1000} />,
    document.getElementById('content')
);