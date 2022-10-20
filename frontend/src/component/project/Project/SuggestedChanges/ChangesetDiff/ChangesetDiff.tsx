import { VFC } from 'react';
import { Box, Paper, Typography, Card, Chip, styled } from '@mui/material';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip'; // FIXME: refactor - extract to common
import { ISuggestChange } from 'interfaces/suggestChangeset';
import EnvironmentIcon from '../../../../common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from '../../../../common/StringTruncator/StringTruncator';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';

type ChangesetDiffProps = {
    changeset?: ISuggestChange[];
};

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(560)]: {
        flexDirection: 'column',
        textAlign: 'center',
    },
}));

export const ChangesetDiff: VFC<ChangesetDiffProps> = ({
    changeset: changeSet,
}) => (
    <Paper
        elevation={4}
        sx={{
            border: '1px solid',
            p: 2,
            borderColor: theme => theme.palette.dividerAlternative,
            display: 'flex',
            gap: 2,
            flexDirection: 'column',
            borderRadius: theme => `${theme.shape.borderRadius}px`,
        }}
    >
        <StyledHeader>
            <EnvironmentIcon enabled={true} />
            <div>
                <StringTruncator
                    text={`production`}
                    maxWidth="100"
                    maxLength={15}
                />
            </div>
        </StyledHeader>
        {/*// @ts-ignore FIXME: types */}
        {changeSet?.map(item => (
            <Card
                key={item.feature}
                elevation={0}
                sx={{
                    borderRadius: theme => `${theme.shape.borderRadius}px`,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: theme => theme.palette.dividerAlternative,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: theme =>
                            theme.palette.tableHeaderBackground,
                        p: 2,
                    }}
                >
                    <Typography>{item.feature}</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    {/*
                      // @ts-ignore FIXME: types */}
                    {item?.changes?.map(change => {
                        if (change?.action === 'updateEnabled') {
                            return (
                                <Box key={change?.id}>
                                    New status:{' '}
                                    <PlaygroundResultChip
                                        showIcon={false}
                                        label={
                                            change?.payload
                                                ? 'Enabled'
                                                : 'Disabled'
                                        }
                                        enabled={change?.payload}
                                    />
                                </Box>
                            );
                        }
                        return (
                            <Box key={change.id}>
                                Change with ID: {change.id}
                            </Box>
                        );
                    })}
                </Box>
            </Card>
        ))}
    </Paper>
);
