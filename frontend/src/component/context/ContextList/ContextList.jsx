import PropTypes from 'prop-types';
import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import {
    CREATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
} from '../../AccessProvider/permissions';
import {
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
    Button,
} from '@material-ui/core';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from './styles';
import ConfirmDialogue from '../../common/Dialogue';
import AccessContext from '../../../contexts/AccessContext';

const ContextList = ({ removeContextField, history, contextFields }) => {
    const { hasAccess } = useContext(AccessContext);
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const smallScreen = useMediaQuery('(max-width:700px)');
    const [name, setName] = useState();

    const styles = useStyles();
    const contextList = () =>
        contextFields.map(field => (
            <ListItem key={field.name} classes={{ root: styles.listItem }}>
                <ListItemIcon>
                    <Icon>album</Icon>
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Link to={`/context/edit/${field.name}`}>
                            <strong>{field.name}</strong>
                        </Link>
                    }
                    secondary={field.description}
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
                                <Icon>delete</Icon>
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
                                <Icon>add</Icon>
                            </IconButton>
                        </Tooltip>
                    }
                    elseShow={
                        <Button
                            onClick={() => history.push('/context/create')}
                            color="primary"
                            variant="contained"
                        >
                            Add new context field
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
                    condition={contextFields.length > 0}
                    show={contextList}
                    elseShow={<ListItem>No context fields defined</ListItem>}
                />
            </List>
            <ConfirmDialogue
                open={showDelDialogue}
                onClick={() => {
                    removeContextField({ name });
                    setName(undefined);
                    setShowDelDialogue(false);
                }}
                onClose={() => {
                    setName(undefined);
                    setShowDelDialogue(false);
                }}
                title="Really delete context field"
            />
        </PageContent>
    );
};

ContextList.propTypes = {
    contextFields: PropTypes.array.isRequired,
    removeContextField: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default ContextList;
