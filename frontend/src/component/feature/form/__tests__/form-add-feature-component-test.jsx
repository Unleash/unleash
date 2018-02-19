import React from 'react';
import AddFeatureComponent from './../form-add-feature-component';
import { shallow } from 'enzyme/build/index';

jest.mock('react-mdl');
jest.mock('../strategies-section-container', () => 'StrategiesSection');

it('render the create feature page', () => {
    let input = {
        name: 'feature',
        nameError: {},
        description: 'Description',
        enabled: false,
    };
    const tree = shallow(
        <AddFeatureComponent
            input={input}
            onSubmit={jest.fn()}
            setValue={jest.fn()}
            addStrategy={jest.fn()}
            removeStrategy={jest.fn()}
            moveStrategy={jest.fn()}
            onCancel={jest.fn()}
            updateStrategy={jest.fn()}
            validateName={jest.fn()}
            initCallRequired={false}
            title="title"
        />
    );
    expect(tree).toMatchSnapshot();
});

let input = {
    name: 'feature',
    nameError: {},
    description: 'Description',
    enabled: false,
};

let validateName = jest.fn();
let setValue = jest.fn();
let onSubmit = jest.fn();
let addStrategy = jest.fn();
let removeStrategy = jest.fn();
let moveStrategy = jest.fn();
let onCancel = jest.fn();
let updateStratgy = jest.fn();
let init = jest.fn();
let eventMock = {
    preventDefault: () => {},
    stopPropagation: () => {},
    target: {
        name: 'NAME',
    },
};
const buildComponent = (setValue, validateName) => (
    <AddFeatureComponent
        input={input}
        onSubmit={onSubmit}
        setValue={setValue}
        addStrategy={addStrategy}
        removeStrategy={removeStrategy}
        moveStrategy={moveStrategy}
        onCancel={onCancel}
        updateStrategy={updateStratgy}
        validateName={validateName}
        initCallRequired
        title="title"
        init={init}
    />
);

it('add a feature name with validation', () => {
    let called = false;
    validateName = () => {
        called = true;
    };
    const wrapper = shallow(buildComponent(setValue, validateName));
    wrapper
        .find('react-mdl-Textfield')
        .first()
        .simulate('blur', eventMock);
    expect(called).toBe(true);
});

it('set a value for feature name', () => {
    let called = false;
    setValue = () => {
        called = true;
    };
    let wrapper = shallow(buildComponent(setValue, validateName));
    wrapper
        .find('react-mdl-Textfield')
        .first()
        .simulate('change', eventMock);
    expect(called).toBe(true);
});

it('set a description for feature name', () => {
    let called = false;
    setValue = () => {
        called = true;
    };
    let wrapper = shallow(buildComponent(setValue, validateName));
    wrapper
        .find('react-mdl-Textfield')
        .last()
        .simulate('change', eventMock);
    expect(called).toBe(true);
});

it('switch the toggle', () => {
    let called = false;
    setValue = () => {
        called = true;
    };
    let wrapper = shallow(buildComponent(setValue, validateName));
    eventMock.target.enabled = false;
    wrapper
        .find('react-mdl-Switch')
        .last()
        .simulate('change', eventMock);
    expect(called).toBe(true);
});
