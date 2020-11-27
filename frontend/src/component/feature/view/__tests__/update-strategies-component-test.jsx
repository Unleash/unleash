import React from 'react';
import UpdateStrategiesComponent from '../update-strategies-component';
import { shallow } from 'enzyme/build';

jest.mock('react-mdl');
// jest.mock('../strategies-section-container', () => 'StrategiesSection');

it('render the create feature page', () => {
    let strategies = [{ name: 'default' }];
    const tree = shallow(
        <UpdateStrategiesComponent
            featureToggleName="some-toggle"
            configuredStrategies={strategies}
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
