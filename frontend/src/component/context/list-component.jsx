import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemAction, ListItemContent, IconButton, Card } from 'react-mdl';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_CONTEXT_FIELD, DELETE_CONTEXT_FIELD } from '../../permissions';

class ContextFieldListComponent extends Component {
    static propTypes = {
        contextFields: PropTypes.array.isRequired,
        fetchContext: PropTypes.func.isRequired,
        removeContextField: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    componentDidMount() {
        // this.props.fetchContext();
    }

    removeContextField = (contextField, evt) => {
        evt.preventDefault();
        this.props.removeContextField(contextField);
    };

    render() {
        const { contextFields, hasPermission } = this.props;

        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <HeaderTitle
                    title="Context Fields"
                    actions={
                        hasPermission(CREATE_CONTEXT_FIELD) ? (
                            <IconButton
                                raised
                                colored
                                accent
                                name="add"
                                onClick={() => this.props.history.push('/context/create')}
                                title="Add new context field"
                            />
                        ) : (
                            ''
                        )
                    }
                />
                <List>
                    {contextFields.length > 0 ? (
                        contextFields.map((field, i) => (
                            <ListItem key={i} twoLine>
                                <ListItemContent icon="album" subtitle={field.description}>
                                    <Link to={`/context/edit/${field.name}`}>
                                        <strong>{field.name}</strong>
                                    </Link>
                                </ListItemContent>
                                <ListItemAction>
                                    {hasPermission(DELETE_CONTEXT_FIELD) ? (
                                        <IconButton
                                            name="delete"
                                            title="Remove contextField"
                                            onClick={this.removeContextField.bind(this, field)}
                                        />
                                    ) : (
                                        ''
                                    )}
                                </ListItemAction>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>No context fields defined</ListItem>
                    )}
                </List>
            </Card>
        );
    }
}

export default ContextFieldListComponent;
