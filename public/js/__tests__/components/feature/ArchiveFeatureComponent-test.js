jest.dontMock("../../../components/feature/ArchiveFeatureComponent");
jest.mock("../../../stores/FeatureToggleActions");
jest.autoMockOff();

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var FeatureArchive      = require("../../../components/feature/ArchiveFeatureComponent");
var FeatureActions  = require("../../../stores/FeatureToggleActions");

describe("FeatureForm", function () {
    var Component;
    beforeEach(function() {
        var archivedToggles = [
            { name: "featureX" },
            { name: "featureY" }
        ];

        Component = TestUtils.renderIntoDocument(
            <FeatureArchive archivedFeatures={archivedToggles} />);
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

        jest.runAllTimers();
        expect(FeatureActions.revive.triggerPromise).toBeCalled();
    });
});
