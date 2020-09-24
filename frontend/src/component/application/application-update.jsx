import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Cell } from 'react-mdl';
import StatefulTextfield from './stateful-textfield';
import icons from './icon-names';
import MySelect from '../common/select';

function ApplicationUpdate({ application, storeApplicationMetaData }) {
    const { appName, icon, url, description } = application;

    return (
        <Grid>
            <Cell col={12}>
                <MySelect
                    label="Icon"
                    options={icons.map(v => ({ key: v, label: v }))}
                    value={icon || 'apps'}
                    onChange={e => storeApplicationMetaData(appName, 'icon', e.target.value)}
                    filled
                />
                <StatefulTextfield
                    value={url}
                    label="Application URL"
                    placeholder="https://example.com"
                    type="url"
                    onBlur={e => storeApplicationMetaData(appName, 'url', e.target.value)}
                />

                <br />
                <StatefulTextfield
                    value={description}
                    label="Description"
                    rows={2}
                    onBlur={e => storeApplicationMetaData(appName, 'description', e.target.value)}
                />
            </Cell>
        </Grid>
    );
}

ApplicationUpdate.propTypes = {
    application: PropTypes.object.isRequired,
    storeApplicationMetaData: PropTypes.func.isRequired,
};

export default ApplicationUpdate;
