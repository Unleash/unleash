import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { List, ListItem, ListItemContent, Card, IconButton } from 'react-mdl';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_TAG, DELETE_TAG } from '../../permissions';

class TagsListComponent extends Component {
    static propTypes = {
        tags: PropTypes.array.isRequired,
        fetchTags: PropTypes.func.isRequired,
        removeTag: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchTags();
    }

    removeTag = (tag, evt) => {
        evt.preventDefault();
        this.props.removeTag(tag);
    };

    render() {
        const { tags, hasPermission } = this.props;
        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <HeaderTitle
                    title="Tags"
                    actions={
                        hasPermission(CREATE_TAG) ? (
                            <IconButton
                                raised
                                name="add"
                                onClick={() => this.props.history.push('/tags/create')}
                                title="Add new tag"
                            />
                        ) : (
                            ''
                        )
                    }
                />
                <List>
                    {tags.length > 0 ? (
                        tags.map((tag, i) => (
                            <ListItem key={i} twoLine>
                                <ListItemContent icon="label" subtitle={tag.type}>
                                    <strong>{tag.value}</strong>
                                </ListItemContent>
                                {hasPermission(DELETE_TAG) ? (
                                    <IconButton
                                        name="delete"
                                        onClick={this.removeTag.bind(this, { type: tag.type, value: tag.value })}
                                    />
                                ) : (
                                    ''
                                )}
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>No entries</ListItem>
                    )}
                </List>
            </Card>
        );
    }
}

export default TagsListComponent;
