import React, { PropTypes } from 'react';
import { Card, CardTitle } from 'react-mdl';

import FormComponent from './form';
import { styles as commonStyles } from '../common';

const FormAddComponent = ({ title, ...formProps }) => (
    <Card className={commonStyles.fullwidth}>
        <CardTitle style={{ paddingTop: '24px' }}>{title}</CardTitle>
        <FormComponent {...formProps}/>
    </Card>
);

FormAddComponent.propTypes = {
    title: PropTypes.string,
};

export default FormAddComponent;
