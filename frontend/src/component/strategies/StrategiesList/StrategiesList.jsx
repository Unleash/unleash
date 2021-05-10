import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link, useHistory } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {
    List,
    ListItem,
    ListItemAvatar,
    IconButton,
    Icon,
    ListItemText,
    Button,
    Tooltip,
} from '@material-ui/core';
import {
    CREATE_STRATEGY,
    DELETE_STRATEGY,
} from '../../AccessProvider/permissions';

import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';

import { useStyles } from './styles';
import AccessContext from '../../../contexts/AccessContext';
import Dialogue from '../../common/Dialogue';

const StrategiesList = ({
    strategies,
    fetchStrategies,
    removeStrategy,
    deprecateStrategy,
    reactivateStrategy,
}) => {
    const history = useHistory();
    const styles = useStyles();
    const smallScreen = useMediaQuery('(max-width:700px)');
    const { hasAccess } = useContext(AccessContext);
    const [dialogueMetaData, setDialogueMetaData] = useState({ show: false });

    useEffect(() => {
        fetchStrategies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const headerButton = () => (
        <ConditionallyRender
            condition={hasAccess(CREATE_STRATEGY)}
            show={
                <ConditionallyRender
                    condition={smallScreen}
                    show={
                        <Tooltip title="Add new strategy">
                            <IconButton
                                onClick={() =>
                                    history.push('/strategies/create')
                                }
                            >
                                <Icon>add</Icon>
                            </IconButton>
                        </Tooltip>
                    }
                    elseShow={
                        <Button
                            onClick={() => history.push('/strategies/create')}
                            color="primary"
                            variant="contained"
                        >
                            Add new strategy
                        </Button>
                    }
                />
            }
        />
    );

    const strategyLink = ({ name, deprecated }) => (
        <Link to={`/strategies/view/${name}`}>
            <strong>{name}</strong>
            <ConditionallyRender
                condition={deprecated}
                show={<small> (Deprecated)</small>}
            />
        </Link>
    );

    const reactivateButton = strategy => (
        <Tooltip title="Reactivate activation strategy">
            <IconButton
                onClick={() =>
                    setDialogueMetaData({
                        show: true,
                        title: 'Really reactivate strategy?',
                        onConfirm: () => reactivateStrategy(strategy),
                    })
                }
            >
                <Icon>visibility</Icon>
            </IconButton>
        </Tooltip>
    );

    const deprecateButton = strategy => (
        <ConditionallyRender
            condition={strategy.name === 'default'}
            show={
                <Tooltip title="You cannot deprecate the default strategy">
                    <div>
                        <IconButton disabled>
                            <Icon>visibility_off</Icon>
                        </IconButton>
                    </div>
                </Tooltip>
            }
            elseShow={
                <Tooltip title="Deprecate activation strategy">
                    <div>
                        <IconButton
                            onClick={() =>
                                setDialogueMetaData({
                                    show: true,
                                    title: 'Really deprecate strategy?',
                                    onConfirm: () =>
                                        deprecateStrategy(strategy),
                                })
                            }
                        >
                            <Icon>visibility_off</Icon>
                        </IconButton>
                    </div>
                </Tooltip>
            }
        />
    );

    const deleteButton = strategy => (
        <ConditionallyRender
            condition={strategy.editable}
            show={
                <Tooltip title="Delete strategy">
                    <IconButton
                        onClick={() =>
                            setDialogueMetaData({
                                show: true,
                                title: 'Really delete strategy?',
                                onConfirm: () => removeStrategy(strategy),
                            })
                        }
                    >
                        <Icon>delete</Icon>
                    </IconButton>
                </Tooltip>
            }
            elseShow={
                <Tooltip title="You cannot delete a built-in strategy">
                    <div>
                        <IconButton disabled>
                            <Icon>delete</Icon>
                        </IconButton>
                    </div>
                </Tooltip>
            }
        />
    );

    const strategyList = () =>
        strategies.map(strategy => (
            <ListItem
                key={strategy.name}
                classes={{
                    root: classnames(styles.listItem, {
                        [styles.deprecated]: strategy.deprecated,
                    }),
                }}
            >
                <ListItemAvatar>
                    <Icon style={{ color: '#0000008a' }}>extension</Icon>
                </ListItemAvatar>
                <ListItemText
                    primary={strategyLink(strategy)}
                    secondary={strategy.description}
                />
                <ConditionallyRender
                    condition={strategy.deprecated}
                    show={reactivateButton(strategy)}
                    elseShow={deprecateButton(strategy)}
                />
                <ConditionallyRender
                    condition={hasAccess(DELETE_STRATEGY)}
                    show={deleteButton(strategy)}
                />
            </ListItem>
        ));

    const onDialogConfirm = () => {
        dialogueMetaData?.onConfirm();
        setDialogueMetaData(prev => ({ ...prev, show: false }));
    };

    return (
        <PageContent
            headerContent={
                <HeaderTitle title="Strategies" actions={headerButton()} />
            }
        >
            <Dialogue
                open={dialogueMetaData.show}
                onClick={onDialogConfirm}
                title={dialogueMetaData?.title}
                onClose={() =>
                    setDialogueMetaData(prev => ({ ...prev, show: false }))
                }
            />
            <List>
                <ConditionallyRender
                    condition={strategies.length > 0}
                    show={strategyList()}
                    elseShow={<ListItem>No strategies found</ListItem>}
                />
            </List>
        </PageContent>
    );
};

StrategiesList.propTypes = {
    strategies: PropTypes.array.isRequired,
    fetchStrategies: PropTypes.func.isRequired,
    removeStrategy: PropTypes.func.isRequired,
    deprecateStrategy: PropTypes.func.isRequired,
    reactivateStrategy: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    name: PropTypes.string,
    deprecated: PropTypes.bool,
};

export default StrategiesList;
