'use strict';
jest.dontMock("../../../components/feature/FeatureList");
jest.dontMock("../../../components/feature/Feature");

const React           = require("react/addons");
const TestUtils       = React.addons.TestUtils;
const FeatureList     = require("../../../components/feature/FeatureList");

describe("FeatureList", () => {
    let Component;
    let features;

    beforeEach(() => {
        features = [
            { name: "featureX", strategy: "other" },
            { name: "group.featureY", strategy: "default" }
        ];
        const strategies=[
            { name: "default" }
        ];
        Component = TestUtils .renderIntoDocument(<FeatureList features={features} strategies={strategies} />);
    });

    afterEach(() => {
        React.unmountComponentAtNode(document.body);
    });

    it("should render all features", () => {
        const features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(2);
    });

    it("should filter list of features", () => {
        const filterNode = Component.refs.filter.getDOMNode();
        TestUtils.Simulate.change(filterNode, { target: { value: "group" } });

        const features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(1);
    });

    it("should filter list of features ignoring case", () => {
        const filterNode = Component.refs.filter.getDOMNode();
        TestUtils.Simulate.change(filterNode, { target: { value: "GROUP" } });

        const features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(1);
        expect(features[0].textContent).toMatch("group");
    });

    it("should filter list of features by strategy name", () => {
        const searchString = "other";
        const filterNode = Component.refs.filter.getDOMNode();
        TestUtils.Simulate.change(filterNode, { target: { value: searchString } });

        const features = Component.getDOMNode().querySelectorAll(".feature");
        expect(features.length).toEqual(1);
        expect(features[0].textContent).toMatch(searchString);
    });
});
