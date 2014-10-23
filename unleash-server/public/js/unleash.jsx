/** @jsx React.DOM */
/* jshint quotmark:false */

//  FeatureListPage
//      Meny
//      FeatureList
//          Feature
//              - name
//              - status
//              - description
//              - button-edit
//              - button-delete
//              - toggle-status
//
//  NewFeaturePage
//      Meny
//      NewFeatureForm

var FeatureForm = React.createClass({

    getInitialState: function () {
        return {name: '', description: '', strategy: 'Default'};
    },

    handleNameChange: function(e) { this.setState({name: e.target.value.trim()}); },
    handleDescriptionChange: function(e) { this.setState({description: e.target.value.trim()}); },
    handleStrategyChange: function(e) { this.setState({strategy: e.target.value.trim()}); },

    handleSubmit: function(e) {
        e.preventDefault();
        this.props.onFeatureSubmit(this.state);
        return;
    },

    render: function () {
        return (
            <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <fieldset>

                    <legend>Add a new feature</legend>

                    <div className="control-group">
                        <label className="control-label" htmlFor="name">Name </label>
                        <div className="controls">
                            <input
                                id="name"
                                type="text"
                                placeholder="Superfeature"
                                className="input-large"
                                required=""
                                onChange={this.handleNameChange}
                                value={this.state.name} />
                            <p className="help-block">Give the feature a name</p>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label" htmlFor="description">Description</label>
                        <div className="controls">
                            <input
                                id="description"
                                type="text"
                                placeholder="It does this and that "
                                className="input-large"
                                onChange={this.handleDescriptionChange}
                                value={this.state.description} />
                            <p className="help-block">Describe the feature</p>
                        </div>
                    </div>

                    <div className="control-group">
                        <label className="control-label" htmlFor="strategy">Strategy</label>
                        <div className="controls">
                            <select
                                id="strategy"
                                className="input-large"
                                onChange={this.handleStrategyChange}
                                value={this.state.strategy}>
                                <option value="Default">Default</option>
                            </select>
                        </div>
                    </div>

                    <div className="control-group">
                        <div className="controls">
                            <input type="submit" value="Save" className="btn btn-success" />
                        </div>
                    </div>

                </fieldset>
            </form>
        );
    }
});

var Feature = React.createClass({
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
                         <button className='pam mtl mll'>Edit</button>
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

var FeatureList = React.createClass({
    getInitialState: function() {
        return {
            features: []
        };
    },

    componentDidMount: function () {
        reqwest('/features').then(this.setFeatures);
    },

    setFeatures: function (data) {
        this.setState({features: data.features});
    },

    updateFeature: function (changeRequest) {
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
        }.bind(this), function() {
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
          // how do we communicate success?
        }.bind(this), function() {
            window.alert('create failed');
        }.bind(this));
    },

    render: function () {
        var featureNodes = this.state.features.map(function (feature) {
            return (
                <Feature feature={feature} updateFeature={this.updateFeature} />
            );
        }.bind(this));

        return (
            <div className='panel panel-primary'>
                <div className='panel-heading'>
                    <h3 className='panel-title'>Features</h3>
                </div>
                <div className='panel-body'>
                    {featureNodes}
                    <FeatureForm onFeatureSubmit={this.createFeature}/>
                </div>
            </div>
        );
    }
});

React.renderComponent(
    new FeatureList(null),
    document.getElementById('content')
);