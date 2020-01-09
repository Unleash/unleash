import React from 'react';
import UpdateFeatureComponent from './../form-update-feature-component';
import { shallow } from 'enzyme/build/index';

jest.mock('react-mdl');
jest.mock('../strategies-section-container', () => 'StrategiesSection');

it('render the create feature page', () => {
    let input = {
        name: 'feature',
        errors: {},
        description: 'Description',
        enabled: false,
    };
    const tree = shallow(
        <UpdateFeatureComponent
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
