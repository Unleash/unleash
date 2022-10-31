import React from 'react';
import Component from './Figure';
import Layout from '@theme/Layout';
import { BrowserRouter } from 'react-router-dom';

export default {
    title: 'Figure',
    component: Component,
};

const Template = (args) => (
    <BrowserRouter>
        <Layout>
            <Component {...args} />
        </Layout>
    </BrowserRouter>
);

export const WithCaption = Template.bind({});
WithCaption.args = {
    img: '/img/anatomy-of-unleash-constraint.png',
    caption: 'This explanatory caption is visible to everyone.',
};

export const WithCaptionAndAlt = Template.bind({});
WithCaption.args = {
    img: '/img/anatomy-of-unleash-constraint.png',
    caption: 'This explanatory caption is visible to everyone.',
    alt: "This alt text is read out by screen readers and displayed if the image doesn't load",
};
