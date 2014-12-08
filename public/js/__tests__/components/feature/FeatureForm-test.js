jest.dontMock("../../../components/feature/FeatureForm");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;
var FeatureForm = require("../../../components/feature/FeatureForm");
var strategyStore = require("../../../stores/StrategyStore");

describe("FeatureForm", function () {
    var Component;
    beforeEach(function() {
        strategyStore.getStrategies.mockImplementation(function() {
            return {
                then: function (callback) {
                    return callback({
                        strategies: [
                                { name: "default"}
                            ]
                    });
                }
            };
        });
    });

    afterEach(function() {
        React.unmountComponentAtNode(document.body);
    });

    describe("new", function () {
        it("should render empty form", function() {
            Component = TestUtils .renderIntoDocument(<FeatureForm />);
            var name = Component.getDOMNode().querySelectorAll("input");
            expect(name[0].value).toEqual(undefined);
        });
    });

    describe("edit", function () {
        var feature = {name: "Test", strategy: "unknown"};

        it("should show unknown strategy as deleted", function () {
            Component = TestUtils .renderIntoDocument(<FeatureForm feature={feature} />);

            var strategySelect = Component.getDOMNode().querySelector("select");
            expect(strategySelect.value).toEqual("unknown (deleted)");
        });
    });

});