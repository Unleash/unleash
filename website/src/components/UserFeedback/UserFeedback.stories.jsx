import React from 'react';
import Component from './index';

export default {
    title: 'User feedback component',
    component: Component,
};

const Template = (args) => <Component {...args} />;

export const A = Template.bind({});
A.args = {
    x: true,
    y: 45,
    text: 'blah blah blah',
};
