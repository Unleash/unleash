import React from 'react';
import Component, { initialData, FeedbackWrapper } from './index';

export default {
    title: 'User feedback component',
    component: Component,
};

const Template = (args) => <FeedbackWrapper {...args} />;

export const FullComponent = Template.bind({});
FullComponent.args = {
    initialData,
};

export const Step2 = Template.bind({});
Step2.args = {
    initialData: {
        ...initialData,
        currentStep: 2,
    },
};

export const Step3 = Template.bind({});
export const Closed = Template.bind({});
