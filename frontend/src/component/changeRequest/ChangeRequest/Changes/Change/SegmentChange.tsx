import { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Typography, Link } from '@mui/material';
import { ISegmentChange } from '../../../changeRequest.types';
import { SegmentChangeDetails } from './SegmentChangeDetails';

interface ISegmentChangeProps {
    segmentChange: ISegmentChange;
    onNavigate?: () => void;
}

export const SegmentChange: FC<ISegmentChangeProps> = ({
    segmentChange,
    onNavigate,
}) => (
    <Card
        elevation={0}
        sx={theme => ({
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            overflow: 'hidden',
        })}
    >
        <Box
            sx={theme => ({
                backgroundColor: theme.palette.neutral.light,
                borderRadius: theme =>
                    `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0`,
                border: '1px solid',
                borderColor: theme => theme.palette.divider,
                borderBottom: 'none',
                overflow: 'hidden',
            })}
        >
            <Box
                sx={{
                    display: 'flex',
                    pt: 2,
                    pb: 2,
                    px: 3,
                }}
            >
                <Typography>Segment name: </Typography>

                <Link
                    component={RouterLink}
                    to={`/segments/edit/${segmentChange.payload.id}`}
                    color="primary"
                    underline="hover"
                    sx={{
                        marginLeft: 1,
                        '& :hover': {
                            textDecoration: 'underline',
                        },
                    }}
                    onClick={onNavigate}
                >
                    <strong>{segmentChange.payload.name}</strong>
                </Link>
            </Box>
        </Box>
        <SegmentChangeDetails change={segmentChange} />
    </Card>
);
