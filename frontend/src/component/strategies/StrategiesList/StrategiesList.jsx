import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link, useHistory } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import {
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import {
    Add,
    Delete,
    Extension,
    Visibility,
    VisibilityOff,
} from '@material-ui/icons';

import {
    CREATE_STRATEGY,
    DELETE_STRATEGY,
    UPDATE_STRATEGY,
} from '../../providers/AccessProvider/permissions';

import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';

import { useStyles } from './styles';
import AccessContext from '../../../contexts/AccessContext';
import Dialogue from '../../common/Dialogue';
import { ADD_NEW_STRATEGY_ID } from '../../../testIds';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { getHumanReadableStrategyName } from '../../../utils/strategy-names';

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
                        <PermissionIconButton
                            data-test={ADD_NEW_STRATEGY_ID}
                            onClick={() => history.push('/strategies/create')}
                            permission={CREATE_STRATEGY}
                            tooltip={'Add new strategy'}
                        >
                            <Add />
                        </PermissionIconButton>
                    }
                    elseShow={
                        <PermissionButton
                            onClick={() => history.push('/strategies/create')}
                            color="primary"
                            permission={CREATE_STRATEGY}
                            variant="contained"
                            data-test={ADD_NEW_STRATEGY_ID}
                            tooltip={'Add new strategy'}
                        >
                            Add new strategy
                        </PermissionButton>
                    }
                />
            }
        />
    );

    const strategyLink = ({ name, deprecated }) => (
        <Link to={`/strategies/view/${name}`}>
            <strong>{getHumanReadableStrategyName(name)}</strong>
            <ConditionallyRender
                condition={deprecated}
                show={<small> (Deprecated)</small>}
            />
        </Link>
    );

    const reactivateButton = strategy => (
        <Tooltip title="Reactivate activation strategy">
            <PermissionIconButton
                onClick={() =>
                    setDialogueMetaData({
                        show: true,
                        title: 'Really reactivate strategy?',
                        onConfirm: () => reactivateStrategy(strategy),
                    })
                }
                permission={UPDATE_STRATEGY}
                tooltip={'Reactivate activation strategy'}
            >
                <VisibilityOff />
            </PermissionIconButton>
        </Tooltip>
    );

    const deprecateButton = strategy => (
        <ConditionallyRender
            condition={strategy.name === 'default'}
            show={
                <Tooltip title="You cannot deprecate the default strategy">
                    <div>
                        <IconButton disabled>
                            <Visibility />
                        </IconButton>
                    </div>
                </Tooltip>
            }
            elseShow={
                <div>
                    <PermissionIconButton
                        onClick={() =>
                            setDialogueMetaData({
                                show: true,
                                title: 'Really deprecate strategy?',
                                onConfirm: () => deprecateStrategy(strategy),
                            })
                        }
                        permission={UPDATE_STRATEGY}
                        tooltip={'Deprecate activation strategy'}
                    >
                        <Visibility />
                    </PermissionIconButton>
                </div>
            }
        />
    );

    const deleteButton = strategy => (
        <ConditionallyRender
            condition={strategy.editable}
            show={
                <PermissionIconButton
                    onClick={() =>
                        setDialogueMetaData({
                            show: true,
                            title: 'Really delete strategy?',
                            onConfirm: () => removeStrategy(strategy),
                        })
                    }
                    permission={DELETE_STRATEGY}
                    tooltip={'Delete strategy'}
                >
                    <Delete />
                </PermissionIconButton>
            }
            elseShow={
                <Tooltip title="You cannot delete a built-in strategy">
                    <div>
                        <IconButton disabled>
                            <Delete />
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
                    <Extension style={{ color: '#0000008a' }} />
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
