import { Typography } from '@mui/material';
import { useStyles } from 'component/segments/SegmentEmpty/SegmentEmpty.styles';
import { Link } from 'react-router-dom';

export const SegmentEmpty = () => {
    const { classes } = useStyles();

    return (
        <div className={classes.empty}>
            <Typography className={classes.title}>No segments yet!</Typography>
            <p className={classes.subtitle}>
                Segment makes it easy for you to define who should be exposed to
                your feature. The segment is often a collection of constraints
                and can be reused.
            </p>
            <Link to="/segments/create" className={classes.paramButton}>
                Create your first segment
            </Link>
        </div>
    );
};
