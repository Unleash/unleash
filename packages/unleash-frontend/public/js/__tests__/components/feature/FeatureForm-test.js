'use strict';

jest.dontMock('../../../components/feature/FeatureForm');

const React = require('react/addons');
const TestUtils = React.addons.TestUtils;
const FeatureForm = require('../../../components/feature/FeatureForm');

describe('FeatureForm', () => {
    let Component;
    const strategies = [
        { name: 'default' },
    ];
    afterEach(() => {
        React.unmountComponentAtNode(document.body);
    });

    describe('new', () => {
        it('should render empty form', () => {
            Component = TestUtils .renderIntoDocument(<FeatureForm strategies={strategies} />);
            const value = Component.getDOMNode().querySelectorAll('input');
            expect(value[0].value).toEqual('');
        });
    });

    describe('edit', () => {
        const feature = { name: 'Test', strategy: 'unknown' };

        it('should show unknown strategy as default', () => {
            Component = TestUtils .renderIntoDocument(<FeatureForm feature={feature} strategies={strategies} />);

            const strategySelect = Component.getDOMNode().querySelector('select');
            expect(strategySelect.value).toEqual('default');
        });
    });
});
