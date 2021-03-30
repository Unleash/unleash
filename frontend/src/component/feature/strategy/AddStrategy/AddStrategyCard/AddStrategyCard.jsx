import { Typography, Card, Button, CardHeader, CardContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './AddStrategyCard.styles';

const CreateStrategyCard = ({ strategy, onClick }) => {
    const styles = useStyles();

    return (
        <Card className={styles.addStrategyCard}>
            <CardHeader title={strategy.name} />
            <CardContent>
                <Typography variant="body2">{strategy.description}</Typography>
            </CardContent>
            <Button className={styles.addStrategyButton} onClick={onClick}>
                Configure
            </Button>
        </Card>
    );
};

CreateStrategyCard.propTypes = {
    strategy: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default CreateStrategyCard;
