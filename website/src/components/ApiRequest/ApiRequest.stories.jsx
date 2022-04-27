import React from 'react';
import Component from './index';
import Layout from '@theme/Layout';
import { BrowserRouter } from 'react-router-dom';

export default {
    title: 'API request component',
    component: Component,
};

const Template = (args) => (
    <BrowserRouter>
        <Layout>
            <Component {...args} />
        </Layout>
    </BrowserRouter>
);

export const GET = Template.bind({});
GET.args = {
    verb: 'get',
    url: 'api/admin/segments',
    title: 'List all segments (example).',
};

export const POST = Template.bind({});
POST.args = {
    verb: 'post',
    payload: { name: '<feature-toggle-name>', impressionData: true },
    url: 'api/admin/projects/<project-id>/features',
    title: 'Create a feature toggle with impression data enabled. (example)',
};

export const POSTWithoutPayload = Template.bind({});
POSTWithoutPayload.args = {
    verb: 'post',
    url: 'api/admin/projects/<projectId>/features/<featureName>/environments/<environment>/on',
    title: 'Disable a toggle in an env.',
};

export const PUT = Template.bind({});
PUT.args = {
    verb: 'put',
    payload: { name: '<feature-toggle-name>', impressionData: true },
    url: 'api/admin/projects/<project-id>/features/<feature-id>',
    title: 'Create a feature toggle with impression data enabled (example).',
};

export const PATCH = Template.bind({});
PATCH.args = {
    verb: 'patch',
    payload: [{ op: 'replace', path: '/impressionData', value: true }],
    url: 'api/admin/projects/<project-id>/features/<feature-toggle-name>',
    title: 'Enable impression data on an existing toggle (example).',
};

export const DELETE = Template.bind({});
DELETE.args = {
    verb: 'delete',
    url: 'api/admin/projects/<project-id>/features/<feature-toggle-id>',
    title: 'Create a feature toggle with impression data enabled.',
};

export const GETProxy = Template.bind({});
GETProxy.args = {
    verb: 'get',
    url: 'proxy',
    title: 'Request toggles from the Unleash Proxy',
    endpointType: 'Proxy API',
};
