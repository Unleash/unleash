import React from 'react';
import { initialData, FeedbackWrapper } from './index';

export default {
    title: 'User feedback component',
    component: FeedbackWrapper,
};

const Template = (args) => <FeedbackWrapper {...args} />;

export const FullComponent = Template.bind({});
FullComponent.args = {
    // initialData,
};

export const Step2 = Template.bind({});
Step2.args = {
    seedData: {
        currentStep: 2,
    },
};

export const Step3 = Template.bind({});
Step3.args = {
    seedData: {
        currentStep: 3,
    },
};
export const Closed = Template.bind({});
