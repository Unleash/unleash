import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import {
    CREATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
} from '../../providers/AccessProvider/permissions';
import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
} from '@material-ui/core';
import { Add, Album, Delete, Edit } from '@material-ui/icons';
import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useStyles } from './styles';
import ConfirmDialogue from '../../common/Dialogue';
import AccessContext from '../../../contexts/AccessContext';
import useUnleashContext from '../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import useContextsApi from '../../../hooks/api/actions/useContextsApi/useContextsApi';
import useToast from '../../../hooks/useToast';
import { formatUnknownError } from '../../../utils/format-unknown-error';

const ContextList = () => {
    const { hasAccess } = useContext(AccessContext);
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const smallScreen = useMediaQuery('(max-width:700px)');
    const [name, setName] = useState();
    const { context, refetch } = useUnleashContext();
    const { removeContext } = useContextsApi();
    const { setToastData, setToastApiError } = useToast();
    const history = useHistory();
    const styles = useStyles();

    const onDeleteContext = async name => {
        try {
            await removeContext(name);
            refetch();
            setToastData({
                type: 'success',
                title: 'Successfully deleted context',
                text: 'Your context is now deleted',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
        setName(undefined);
        setShowDelDialogue(false);
    };

    const contextList = () =>
        context.map(field => (
            <ListItem key={field.name} classes={{ root: styles.listItem }}>
                <ListItemIcon>
                    <Album />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <ConditionallyRender
                            condition={hasAccess(UPDATE_CONTEXT_FIELD)}
                            show={
                                <Link to={`/context/edit/${field.name}`}>
                                    <strong>{field.name}</strong>
                                </Link>
                            }
                            elseShow={<strong>{field.name}</strong>}
                        />
                    }
                    secondary={field.description}
                />
                <ConditionallyRender
                    condition={hasAccess(UPDATE_CONTEXT_FIELD)}
                    show={
                        <Tooltip title="Edit context field">
                            <IconButton
                                aria-label="edit"
                                onClick={() =>
                                    history.push(`/context/edit/${field.name}`)
                                }
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                    }
                />
                <ConditionallyRender
                    condition={hasAccess(DELETE_CONTEXT_FIELD)}
                    show={
                        <Tooltip title="Delete context field">
                            <IconButton
                                aria-label="delete"
                                onClick={() => {
                                    setName(field.name);
                                    setShowDelDialogue(true);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    }
                />
            </ListItem>
        ));
    const headerButton = () => (
        <ConditionallyRender
            condition={hasAccess(CREATE_CONTEXT_FIELD)}
            show={
                <ConditionallyRender
                    condition={smallScreen}
                    show={
                        <Tooltip title="Add context type">
                            <IconButton
                                onClick={() => history.push('/context/create')}
                            >
                                <Add />
                            </IconButton>
                        </Tooltip>
                    }
                    elseShow={
                        <Button
                            onClick={() => history.push('/context/create')}
                            color="primary"
                            variant="contained"
                        >
                            New context field
                        </Button>
                    }
                />
            }
        />
    );
    return (
        <PageContent
            headerContent={
                <HeaderTitle
                    actions={headerButton()}
                    title={'Context fields'}
                />
            }
        >
            <List>
                <ConditionallyRender
                    condition={context.length > 0}
                    show={contextList}
                    elseShow={<ListItem>No context fields defined</ListItem>}
                />
            </List>
            <ConfirmDialogue
                open={showDelDialogue}
                onClick={() => onDeleteContext(name)}
                onClose={() => {
                    setName(undefined);
                    setShowDelDialogue(false);
                }}
                title="Really delete context field"
            />
        </PageContent>
    );
};

export default ContextList;
