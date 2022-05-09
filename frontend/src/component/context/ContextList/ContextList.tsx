import { useContext, useState, VFC } from 'react';
import { Add, Album, Delete, Edit } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
} from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    CREATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
} from 'component/providers/AccessProvider/permissions';
import { Dialogue as ConfirmDialogue } from 'component/common/Dialogue/Dialogue';
import AccessContext from 'contexts/AccessContext';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import useContextsApi from 'hooks/api/actions/useContextsApi/useContextsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useStyles } from './styles';

const ContextList: VFC = () => {
    const { hasAccess } = useContext(AccessContext);
    const [showDelDialogue, setShowDelDialogue] = useState(false);
    const smallScreen = useMediaQuery('(max-width:700px)');
    const [name, setName] = useState<string>();
    const { context, refetchUnleashContext } = useUnleashContext();
    const { removeContext } = useContextsApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    const onDeleteContext = async () => {
        try {
            if (name === undefined) {
                throw new Error();
            }
            await removeContext(name);
            refetchUnleashContext();
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
                        <Tooltip title="Edit context field" arrow>
                            <IconButton
                                onClick={() =>
                                    navigate(`/context/edit/${field.name}`)
                                }
                                size="large"
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                    }
                />
                <ConditionallyRender
                    condition={hasAccess(DELETE_CONTEXT_FIELD)}
                    show={
                        <Tooltip title="Delete context field" arrow>
                            <IconButton
                                aria-label="delete"
                                onClick={() => {
                                    setName(field.name);
                                    setShowDelDialogue(true);
                                }}
                                size="large"
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
                        <Tooltip title="Add context type" arrow>
                            <IconButton
                                onClick={() => navigate('/context/create')}
                                size="large"
                            >
                                <Add />
                            </IconButton>
                        </Tooltip>
                    }
                    elseShow={
                        <Button
                            onClick={() => navigate('/context/create')}
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
            header={
                <PageHeader actions={headerButton()} title={'Context fields'} />
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
                onClick={onDeleteContext}
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
