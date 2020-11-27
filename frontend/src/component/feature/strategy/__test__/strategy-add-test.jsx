import React from 'react';
import AddStrategy from '../strategies-add';
import { shallow } from 'enzyme/build';

jest.mock('react-mdl');

const strategies = [
    {
        name: 'default',
        editable: false,
        description: 'Default on/off strategy.',
        parameters: ['t'],
    },
];
let addStrategy = jest.fn();
let fetchStrategies = jest.fn();
let eventMock = {
    preventDefault: () => {},
    stopPropagation: () => {},
    target: {
        name: 'default',
    },
};
const buildComponent = (addStrategy, fetchStrategies, strategies) => (
    <AddStrategy
        addStrategy={addStrategy}
        fetchStrategies={fetchStrategies}
        strategies={strategies}
        featureToggleName="nameOfToggle"
    />
);

it('renders add strategy form with a list of available strategies', () => {
    const tree = shallow(buildComponent(addStrategy, fetchStrategies, strategies));
    expect(tree).toMatchSnapshot();
});

it('add a strategy', () => {
    let called = false;
    addStrategy = () => {
        called = true;
    };
    const addStrategyProto = jest.spyOn(AddStrategy.prototype, 'addStrategy');
    const wrapper = shallow(buildComponent(addStrategy, fetchStrategies, strategies));
    wrapper
        .find('react-mdl-MenuItem')
        .last()
        .simulate('click', eventMock);
    expect(called).toBe(true);
    expect(addStrategyProto).toHaveBeenCalled();
});
