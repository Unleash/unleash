import React from 'react';
import { initialData, FeedbackWrapper } from './index';

export default {
    title: 'User feedback component',
    component: FeedbackWrapper,
};

const Template = (args) => <FeedbackWrapper {...args} />;

export const Step1 = Template.bind({});
Step1.args = {
    open: true,
    seedData: {
        currentStep: 1,
    },
};

export const Step2 = Template.bind({});
Step2.args = {
    seedData: {
        currentStep: 2,
    },
    open: true,
};

export const Step3 = Template.bind({});
Step3.args = {
    seedData: {
        currentStep: 3,
    },
    open: true,
};

export const Step4 = Template.bind({});
Step4.args = {
    seedData: {
        currentStep: 4,
    },
    open: true,
};

export const WithLocalStorage = Template.bind({});
WithLocalStorage.args = {
    open: true,
};

export const Closed = Template.bind({});
