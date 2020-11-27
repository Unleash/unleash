import React from 'react';
import InputList from '../../strategy/input-list';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

it('renders strategy with list as param', () => {
    const list = ['item1', 'item2'];
    const name = 'featureName';
    const tree = renderer.create(<InputList list={list} name={name} setConfig={jest.fn()} />);

    expect(tree).toMatchSnapshot();
});

it('renders strategy with empty list as param', () => {
    const list = [];
    const name = 'featureName';
    const tree = renderer.create(<InputList list={list} name={name} setConfig={jest.fn()} />);

    expect(tree).toMatchSnapshot();
});

it('renders an item as chip', () => {
    let list = ['item1'];
    const name = 'featureName';
    let wrapper = shallow(<InputList list={list} name={name} setConfig={jest.fn()} />);
    expect(wrapper.find('react-mdl-Chip').length).toEqual(1);
    expect(wrapper.find('react-mdl-Chip').text()).toEqual('item1');
});

it('go inside onFocus', () => {
    let list = ['item1'];
    const name = 'featureName';
    const wrapper = shallow(<InputList list={list} name={name} setConfig={jest.fn()} />);
    let focusMock = {
        preventDefault: () => {},
        stopPropagation: () => {},
        key: 'e',
    };
    wrapper.find('react-mdl-Textfield').simulate('focus', focusMock);
});

it('spy onClose', () => {
    let list = ['item1'];
    const name = 'featureName';
    const onClose = jest.spyOn(InputList.prototype, 'onClose');
    let closeMock = {
        preventDefault: () => {},
        stopPropagation: () => {},
    };
    const wrapper = shallow(<InputList list={list} name={name} setConfig={jest.fn()} />);
    wrapper.find('react-mdl-Chip').simulate('close', closeMock);
    expect(onClose).toHaveBeenCalled();
});

it('renders correctly when disabled', () => {
    const list = ['item1', 'item2'];
    const name = 'featureName';
    const tree = renderer.create(<InputList list={list} name={name} setConfig={jest.fn()} disabled />);

    expect(tree).toMatchSnapshot();
});
