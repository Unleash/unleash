import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory } from 'react-router-dom';

import { Button, Icon, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
import { CREATE_TAG, DELETE_TAG } from '../../../permissions';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import HeaderTitle from '../../common/HeaderTitle';
import PageContent from '../../common/PageContent/PageContent';

import { useStyles } from './TagList.styles';

const TagList = ({ tags, fetchTags, removeTag, hasPermission }) => {
    const history = useHistory();
    const smallScreen = useMediaQuery('(max-width:700px)');
    const styles = useStyles();

    useEffect(() => {
        fetchTags();
    }, []);

    const remove = (tag, evt) => {
        evt.preventDefault();
        removeTag(tag);
    };

    const listItem = tag => (
        <ListItem key={`${tag.type}_${tag.value}`} className={styles.tagListItem}>
            <ListItemIcon>
                <Icon>label</Icon>
            </ListItemIcon>
            <ListItemText primary={tag.value} secondary={tag.type} />
            <ConditionallyRender
                condition={hasPermission(DELETE_TAG)}
                show={<DeleteButton tagType={tag.type} tagValue={tag.value} />}
            />
        </ListItem>
    );

    const DeleteButton = ({ tagType, tagValue }) => (
        <Tooltip title="Delete tag">
            <IconButton onClick={e => remove({ type: tagType, value: tagValue }, e)}>
                <Icon>delete</Icon>
            </IconButton>
        </Tooltip>
    );

    DeleteButton.propTypes = {
        tagType: PropTypes.string,
        tagValue: PropTypes.string,
    };

    const AddButton = ({ hasPermission }) => (
        <ConditionallyRender
            condition={hasPermission(CREATE_TAG)}
            show={
                <ConditionallyRender
                    condition={smallScreen}
                    show={
                        <IconButton aria-label="add tag" onClick={() => history.push('/tags/create')}>
                            <Icon>add</Icon>
                        </IconButton>
                    }
                    elseShow={
                        <Tooltip title="Add new tag">
                            <Button
                                color="primary"
                                startIcon={<Icon>add</Icon>}
                                onClick={() => history.push('/tags/create')}
                                variant="contained"
                            >
                                Add new tag
                            </Button>
                        </Tooltip>
                    }
                />
            }
        />
    );
    return (
        <PageContent headerContent={<HeaderTitle title="Tags" actions={<AddButton hasPermission={hasPermission} />} />}>
            <List>
                <ConditionallyRender
                    condition={tags.length > 0}
                    show={tags.map(tag => listItem(tag))}
                    elseShow={
                        <ListItem className={styles.tagListItem}>
                            <ListItemText primary="No tags available" />
                        </ListItem>
                    }
                />
            </List>
        </PageContent>
    );
};

TagList.propTypes = {
    tags: PropTypes.array.isRequired,
    fetchTags: PropTypes.func.isRequired,
    removeTag: PropTypes.func.isRequired,
    hasPermission: PropTypes.func.isRequired,
};

export default TagList;
