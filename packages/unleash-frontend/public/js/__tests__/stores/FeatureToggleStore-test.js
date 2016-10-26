'use strict';

jest.autoMockOff();
jest.dontMock('../../stores/FeatureToggleActions');
jest.dontMock('../../stores/FeatureToggleStore');

describe('FeatureToggleStore', () => {
    let Actions;
    let Store;
    let toggles;

    beforeEach(() => {
        Actions = require('../../stores/FeatureToggleActions');
        Store = require('../../stores/FeatureToggleStore');
        toggles = [
            { name: 'app.feature', enabled: true, strategy: 'default' },
        ];
    });

    it('should be an empty store', () => {
        expect(Store.getFeatureToggles().length).toBe(0);
    });

    it('should inititialize the store', () => {
        Actions.init.completed(toggles);

        jest.runAllTimers();
        expect(Store.getFeatureToggles().length).toBe(1);
        expect(Store.getFeatureToggles()[0].name).toEqual('app.feature');
    });

    it('should add a another toggle', () => {
        Actions.init.completed(toggles);

        const newToggle = { name: 'app.featureB', enabled: true, strategy: 'default' };

        Actions.create.completed(newToggle);

        jest.runAllTimers();
        expect(Store.getFeatureToggles().length).toBe(2);
        expect(Store.getFeatureToggles()[1].name).toEqual('app.featureB');
    });

    it('should archive toggle', () => {
        Actions.init.completed(toggles);

        Actions.archive.completed(toggles[0]);

        jest.runAllTimers();
        expect(Store.getFeatureToggles().length).toBe(0);
    });

    it('should keep toggles in sorted order', () => {
        Actions.init.completed([
            { name: 'A' },
            { name: 'B' },
            { name: 'C' },
        ]);

        Actions.create.completed({ name: 'AA' });

        jest.runAllTimers();
        expect(Store.getFeatureToggles()[0].name).toEqual('A');
        expect(Store.getFeatureToggles()[1].name).toEqual('AA');
        expect(Store.getFeatureToggles()[3].name).toEqual('C');
    });

    it('should update toggle', () => {
        Actions.init.completed(toggles);
        const toggle = toggles[0];

        toggle.enabled = false;
        Actions.update.completed(toggle);


        jest.runAllTimers();
        expect(Store.getFeatureToggles()[0].enabled).toEqual(false);
    });
});
