'use strict';
jest.dontMock("../../../components/feature/ArchiveFeatureComponent");
jest.mock("../../../stores/FeatureToggleActions");
jest.autoMockOff();

const React = require("react/addons");
const TestUtils = React.addons.TestUtils;
const FeatureArchive      = require("../../../components/feature/ArchiveFeatureComponent");
const FeatureActions  = require("../../../stores/FeatureToggleActions");

describe("FeatureForm", () => {
    let Component;
    beforeEach(() => {
        const archivedToggles = [
            { name: "featureX" },
            { name: "featureY" }
        ];

        Component = TestUtils.renderIntoDocument(
            <FeatureArchive archivedFeatures={archivedToggles} />);
    });

    afterEach(() => {
        React.unmountComponentAtNode(document.body);
    });

    it("should render two archived features", () => {
        const rows = Component.getDOMNode().querySelectorAll("tbody tr");

        expect(rows.length).toEqual(2);
    });

    it("should revive archived feature toggle", () => {
        const button = Component.getDOMNode().querySelector("tbody button");
        TestUtils.Simulate.click(button);

        jest.runAllTimers();
        expect(FeatureActions.revive.triggerPromise).toBeCalled();
    });
});
