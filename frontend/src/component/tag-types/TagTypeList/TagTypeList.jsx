import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Button,
    Tooltip,
} from '@material-ui/core';
import { Add, Delete, Edit, Label } from '@material-ui/icons';
import HeaderTitle from '../../common/HeaderTitle';
import PageContent from '../../common/PageContent/PageContent';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import {
    DELETE_TAG_TYPE,
    UPDATE_TAG_TYPE,
} from '../../providers/AccessProvider/permissions';
import Dialogue from '../../common/Dialogue/Dialogue';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import styles from '../TagType.module.scss';
import AccessContext from '../../../contexts/AccessContext';
import useTagTypesApi from '../../../hooks/api/actions/useTagTypesApi/useTagTypesApi';
import useTagTypes from '../../../hooks/api/getters/useTagTypes/useTagTypes';
import useToast from '../../../hooks/useToast';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';

const TagTypeList = () => {
    const { hasAccess } = useContext(AccessContext);
    const [deletion, setDeletion] = useState({ open: false });
    const history = useHistory();
    const smallScreen = useMediaQuery('(max-width:700px)');
    const { deleteTagType } = useTagTypesApi();
    const { tagTypes, refetch } = useTagTypes();
    const { setToastData, setToastApiError } = useToast();

    const deleteTag = async () => {
        try {
            await deleteTagType(deletion.name);
            refetch();
            setDeletion({ open: false });
            setToastData({
                type: 'success',
                show: true,
                text: 'Successfully deleted tag type.',
            });
        } catch (e) {
            setToastApiError(e.toString());
        }
    };

    let header = (
        <HeaderTitle
            title="Tag Types"
            actions={
                <ConditionallyRender
                    condition={hasAccess(UPDATE_TAG_TYPE)}
                    show={
                        <ConditionallyRender
                            condition={smallScreen}
                            show={
                                <Tooltip title="Add tag type">
                                    <IconButton
                                        aria-label="add tag type"
                                        onClick={() =>
                                            history.push('/tag-types/create')
                                        }
                                    >
                                        <Add />
                                    </IconButton>
                                </Tooltip>
                            }
                            elseShow={
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                        history.push('/tag-types/create')
                                    }
                                >
                                    Add new tag type
                                </Button>
                            }
                        />
                    }
                />
            }
        />
    );

    const renderTagType = tagType => {
        let link = (
            <Link to={`/tag-types/edit/${tagType.name}`}>
                <strong>{tagType.name}</strong>
            </Link>
        );
        let deleteButton = (
            <Tooltip title={`Delete ${tagType.name}`}>
                <IconButton
                    onClick={() =>
                        setDeletion({
                            open: true,
                            name: tagType.name,
                        })
                    }
                >
                    <Delete />
                </IconButton>
            </Tooltip>
        );

        return (
            <ListItem
                key={`${tagType.name}`}
                classes={{ root: styles.tagListItem }}
            >
                <ListItemIcon>
                    <Label />
                </ListItemIcon>
                <ListItemText primary={link} secondary={tagType.description} />
                <PermissionIconButton
                    permission={UPDATE_TAG_TYPE}
                    component={Link}
                    to={`/tag-types/edit/${tagType.name}`}
                >
                    <Edit className={styles.icon} />
                </PermissionIconButton>
                <ConditionallyRender
                    condition={hasAccess(DELETE_TAG_TYPE)}
                    show={deleteButton}
                />
            </ListItem>
        );
    };
    return (
        <PageContent headerContent={header}>
            <List>
                <ConditionallyRender
                    condition={tagTypes.length > 0}
                    show={tagTypes.map(tagType => renderTagType(tagType))}
                    elseShow={<ListItem>No entries</ListItem>}
                />
            </List>
            <Dialogue
                title="Really delete Tag type?"
                open={deletion.open}
                onClick={deleteTag}
                onClose={() => {
                    setDeletion({ open: false });
                }}
            />
        </PageContent>
    );
};

TagTypeList.propTypes = {
    tagTypes: PropTypes.array.isRequired,
    fetchTagTypes: PropTypes.func.isRequired,
    removeTagType: PropTypes.func.isRequired,
};

export default TagTypeList;
