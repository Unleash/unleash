jest.dontMock("../../../components/feature/FeatureList");
jest.dontMock("../../../components/feature/Feature");

var React           = require("react/addons");
var TestUtils       = React.addons.TestUtils;
var FeatureList     = require("../../../components/feature/FeatureList");

describe("FeatureList", function () {
    var Component, features;

    beforeEach(function() {
        features = [
            { name: "featureX", strategy: "other" },
            { name: "group.featureY", strategy: "default" }
        ];
        Component = TestUtils .renderIntoDocument(<FeatureList features={features} />);
    });

    afterEach(function() {
        React.unmountComponentAtNode(document.body);
    });

    it("should render all features", function() {
        var features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(2);
    });

    it("should filter list of features", function() {
        var filterNode = Component.refs.filter.getDOMNode();
        TestUtils.Simulate.change(filterNode, {target: {value: "group"}});

        var features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(1);
    });

    it("should filter list of features ignoring case", function() {
        var filterNode = Component.refs.filter.getDOMNode();
        TestUtils.Simulate.change(filterNode, {target: {value: "GROUP"}});

        var features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(1);
        expect(features[0].textContent).toMatch("group");
    });

    it("should filter list of features by strategy name", function() {
        var searchString = "other";
        var filterNode = Component.refs.filter.getDOMNode();
        TestUtils.Simulate.change(filterNode, {target: {value: searchString}});

        var features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(1);
        expect(features[0].textContent).toMatch(searchString);
    });

});