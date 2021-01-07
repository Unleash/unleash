import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemContent, Card, IconButton } from 'react-mdl';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_TAG_TYPE, DELETE_TAG_TYPE } from '../../permissions';

class TagTypesListComponent extends Component {
    static propTypes = {
        tagTypes: PropTypes.array.isRequired,
        fetchTagTypes: PropTypes.func.isRequired,
        removeTagType: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchTagTypes();
    }

    removeTagType = (tagType, evt) => {
        evt.preventDefault();
        this.props.removeTagType(tagType);
    };

    render() {
        const { tagTypes, hasPermission } = this.props;
        return (
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <HeaderTitle
                    title="Tag Types"
                    actions={
                        hasPermission(CREATE_TAG_TYPE) ? (
                            <IconButton
                                raised
                                name="add"
                                onClick={() => this.props.history.push('/tag-types/create')}
                                title="Add new tag type"
                            />
                        ) : (
                            ''
                        )
                    }
                />
                <List>
                    {tagTypes.length > 0 ? (
                        tagTypes.map((tagType, i) => (
                            <ListItem key={i} twoLine>
                                <ListItemContent icon="label" subtitle={tagType.description}>
                                    <Link to={`/tag-types/edit/${tagType.name}`}>
                                        <strong>{tagType.name}</strong>
                                    </Link>
                                </ListItemContent>
                                {hasPermission(DELETE_TAG_TYPE) ? (
                                    <IconButton name="delete" onClick={this.removeTagType.bind(this, tagType.name)} />
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

export default TagTypesListComponent;
