import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory } from 'react-router-dom';

import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import { Add, Label, Delete } from '@material-ui/icons';

import { CREATE_TAG, DELETE_TAG } from '../../AccessProvider/permissions';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import HeaderTitle from '../../common/HeaderTitle';
import PageContent from '../../common/PageContent/PageContent';

import { useStyles } from './TagList.styles';
import AccessContext from '../../../contexts/AccessContext';

const TagList = ({ tags, fetchTags, removeTag }) => {
    const history = useHistory();
    const smallScreen = useMediaQuery('(max-width:700px)');
    const styles = useStyles();
    const { hasAccess } = useContext(AccessContext);

    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = (tag, evt) => {
        evt.preventDefault();
        removeTag(tag);
    };

    const listItem = tag => (
        <ListItem
            key={`${tag.type}_${tag.value}`}
            className={styles.tagListItem}
        >
            <ListItemIcon>
                <Label />
            </ListItemIcon>
            <ListItemText primary={tag.value} secondary={tag.type} />
            <ConditionallyRender
                condition={hasAccess(DELETE_TAG)}
                show={<DeleteButton tagType={tag.type} tagValue={tag.value} />}
            />
        </ListItem>
    );

    const DeleteButton = ({ tagType, tagValue }) => (
        <Tooltip title="Delete tag">
            <IconButton
                onClick={e => remove({ type: tagType, value: tagValue }, e)}
            >
                <Delete />
            </IconButton>
        </Tooltip>
    );

    DeleteButton.propTypes = {
        tagType: PropTypes.string,
        tagValue: PropTypes.string,
    };

    const AddButton = ({ hasAccess }) => (
        <ConditionallyRender
            condition={hasAccess(CREATE_TAG)}
            show={
                <ConditionallyRender
                    condition={smallScreen}
                    show={
                        <IconButton
                            aria-label="add tag"
                            onClick={() => history.push('/tags/create')}
                        >
                            <Add />
                        </IconButton>
                    }
                    elseShow={
                        <Tooltip title="Add new tag">
                            <Button
                                color="primary"
                                startIcon={<Add />}
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
        <PageContent
            headerContent={
                <HeaderTitle
                    title="Tags"
                    actions={<AddButton hasAccess={hasAccess} />}
                />
            }
        >
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
};

export default TagList;
