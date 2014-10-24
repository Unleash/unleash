/** @jsx React.DOM */
/* jshint quotmark:false */

// Unleash
//   - Menu
//   - FeatureList
//       - UnsavedFeature
//       - SavedFeature
//

var Menu = React.createClass({
    render: function() { return <div/>; }
});


var UnsavedFeature = React.createClass({
    // TODO: form
    render: function() { return <div/>; }
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
                <span>
                <input
                    className='pull-left'
                    type='checkbox'
                    checked={this.props.feature.enabled}
                    onChange={this.onChange} />
                    </span>
                <span
                    className='col-xs-4 col-sm-4 col-md-4 col-lg-4'
                    title='{this.props.feature.description}'>{this.props.feature.name}
                </span>
                <span className='col-xs-4 col-sm-4 col-md-4 col-lg-4'>{this.props.feature.strategy}</span>
            </div>
        );
    }
});

var FeatureList = React.createClass({
    render: function() {
        var featureNodes = [];

        this.props.unsavedFeatures.forEach(function(feature) {
            featureNodes.push(<UnsavedFeature feature={feature} onSubmit={this.props.onFeatureSubmit} />);
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
                <div className='panel panel-primary'>
                    <div className='panel-heading'>
                        <h3 className='panel-title'>Features</h3>
                        <div className='text-right'>
                            <button type="button" className="btn btn-success btn-sm">
                                <span className="glyphicon glyphicon-plus"></span> New
                            </button>
                        </div>
                    </div>

                    <div className='panel-body'>
                      {featureNodes}
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
        console.log(feature);
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
                    onFeatureSubmit={this.createFeature} />
            </div>
        );
    }
});


React.renderComponent(
    <Unleash pollInterval={5000} />,
    document.getElementById('content')
);