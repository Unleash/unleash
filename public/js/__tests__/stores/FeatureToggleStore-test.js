jest.autoMockOff()
jest.dontMock('../../stores/FeatureToggleActions');
jest.dontMock('../../stores/FeatureToggleStore');

describe('FeatureToggleStore', function() {

    var Actions, Store, toggles;

    beforeEach(function() {
        Actions = require('../../stores/FeatureToggleActions');
        Store = require('../../stores/FeatureToggleStore');
        toggles = [
            {name: "app.feature", enabled: true, strategy: "default"}
        ];
    });

    it('should be an empty store', function() {
        expect(Store.getFeatureToggles().length).toBe(0);
    });

    it('should inititialize the store', function() {
        Actions.init.completed(toggles);

        jest.runAllTimers();
        expect(Store.getFeatureToggles().length).toBe(1);
        expect(Store.getFeatureToggles()[0].name).toEqual("app.feature");
    });

    it('should add a another toggle', function() {
        Actions.init.completed(toggles);

        var newToggle = {name: "app.featureB", enabled: true, strategy: "default"};

        Actions.create.completed(newToggle);

        jest.runAllTimers();
        expect(Store.getFeatureToggles().length).toBe(2);
        expect(Store.getFeatureToggles()[1].name).toEqual("app.featureB");
    });

    it('should archive toggle', function() {
        Actions.init.completed(toggles);

        Actions.archive.completed(toggles[0]);

        jest.runAllTimers();
        expect(Store.getFeatureToggles().length).toBe(0);
    });


    it('should keep toggles in sorted order', function() {
        Actions.init.completed([
            {name: "A"},
            {name: "B"},
            {name: "C"}
        ]);

        Actions.create.completed({name: "AA"});

        jest.runAllTimers();
        expect(Store.getFeatureToggles()[0].name).toEqual("A");
        expect(Store.getFeatureToggles()[1].name).toEqual("AA");
        expect(Store.getFeatureToggles()[3].name).toEqual("C");
    });

    it('should update toggle', function() {
        Actions.init.completed(toggles);
        var toggle = toggles[0];

        toggle.enabled = false;
        Actions.update.completed(toggle);


        jest.runAllTimers();
        expect(Store.getFeatureToggles()[0].enabled).toEqual(false);
    });




});
