jest.dontMock("../../../components/feature/ArchiveFeatureComponent");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var FeatureArchive = require("../../../components/feature/ArchiveFeatureComponent");
var FeatureStore = require("../../../stores/FeatureStore");

describe("FeatureForm", function () {
    var Component;
    beforeEach(function() {
        FeatureStore.getArchivedFeatures.mockImplementation(function() {
            return {
                then: function (callback) {
                    return callback({
                        features: [
                            { name: "featureX" },
                            { name: "featureY" }
                        ]
                    });
                }
            };
        });
        FeatureStore.reviveFeature.mockImplementation(function() {
            return {
                then: function (callback) {return callback();}
            };
        });

        Component = TestUtils .renderIntoDocument(<FeatureArchive />);
    });

    afterEach(function() {
        React.unmountComponentAtNode(document.body);
    });

    it("should render two archived features", function() {
        var rows = Component.getDOMNode().querySelectorAll("tbody tr");
        expect(rows.length).toEqual(2);
    });

    it("should revive archived feature toggle", function() {
        var button = Component.getDOMNode().querySelector("tbody button");
        TestUtils.Simulate.click(button);
        var rows = Component.getDOMNode().querySelectorAll("tbody tr");

        expect(rows.length).toEqual(1);
        expect(FeatureStore.reviveFeature).toBeCalledWith({
            name: "featureX"
        });
    });
});