/** @jsx React.DOM */

//   FeatureList
//     Feature
//       - name
//       - status
//       - description
//       - button-edit
//       - button-delete
//       - toggle-status
//   FeatureForm

//    StrategyList
//      Strategy
//    StrategyForm

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

    updateFeature: function (feature) {
        var newFeatures = this.state.features;
        newFeatures.forEach(function(f){
            if(f.name === feature.name) {
                f = feature;
            }
        });

        reqwest({
            url: 'features/' + feature.name,
            method: 'post',
            type: 'json',
            data: feature
        }).then(function() {
            this.setState({features: newFeatures});
        }.bind(this), function() {
            alert("update failed");
        }.bind(this));
    },

    render: function () {
        var featureNodes = this.state.features.map(function (feature) {
            return (
                <Feature feature={feature} updateFeature={this.updateFeature} />
            );
        }.bind(this));

        return (
            <div className="mod shadow">
              <div className="inner">
                <div className="bd">
                  {featureNodes}
                </div>
              </div>
            </div>
        );
    }
});

var Feature = React.createClass({
    // TODO: validate props?
/*
    handleStatusChange: function (feature, event) {
        console.log(feature);
        console.log(event);
    },
*/
    handleEnableChange: function(event) {
        var feature = this.props.feature;

        feature.enabled = event.target.checked;
        this.props.updateFeature(feature);
    },

    render: function () {
        return (
            <div>
              <div className="line">
                <div className="unit r-size1of3">
                  <div className="mod">
                    <div className="inner">
                       <div className="bd">
                         <p>{this.props.feature.name}</p>
                         <p className="neutral">{this.props.feature.description}</p>

                       </div>
                    </div>
                  </div>
                </div>

                <div className="unit r-size1of3">
                  <div className="mod">
                    <div className="inner">
                       <div className="bd">
                         <p>
                           <label>
                              {this.props.feature.status}
                              <input
                                 type="checkbox"
                                 checked={this.props.feature.enabled}
                                 className="mll"
                                 onChange={this.handleEnableChange}
                              />
                           </label>
                         </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="unit r-size1of3">
                  <div className="mod">
                    <div className="inner">
                       <div className="bd">
                         <button className="pam mtl mll">Edit</button>
                         <button className="pam mtl mll">Delete</button>
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


React.renderComponent(
    FeatureList(null),
    document.getElementById('content')
);