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
        reqwest("/features").then(this.setFeatures);
    },

    render: function () {
        var featureNodes = this.state.features.map(function (feature) {
            return (
                <Feature feature={feature} />
            );
        });

        return (
            <div className="mod shadow">
              <div className="inner">
                <div className="bd">
                  {featureNodes}
                </div>
              </div>
            </div>
        );
    },

    setFeatures: function (data) {
        this.setState({features: data.features});
    }
});

var Feature = React.createClass({
    // TODO: validate props?

    handleStatusChange: function (event) {
        console.log(event);
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
                                 checked={this.props.feature.status === 'on'}
                                 className="mll"
                                 onChange={this.handleStatusChange}
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