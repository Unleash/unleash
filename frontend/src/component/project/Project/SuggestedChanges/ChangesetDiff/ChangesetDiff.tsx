import { VFC } from 'react';
import { Box, Typography, Card, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ISuggestChange } from 'interfaces/suggestChangeset';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { PlaygroundResultChip } from 'component/playground/Playground/PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip'; // FIXME: refactor - extract to common
import { ChangeItem } from './ChangeItem/ChangeItem';

type ChangesetDiffProps = {
    changes?: ISuggestChange[];
    state: string;
};

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down(560)]: {
        flexDirection: 'column',
        textAlign: 'center',
    },
    paddingBottom: theme.spacing(1),
}));

export const ChangesetDiff: VFC<ChangesetDiffProps> = ({ changes, state }) => (
    <Box
        sx={{
            p: 3,
            border: '2px solid',
            borderColor: theme => theme.palette.playgroundBackground,
            display: 'flex',
            gap: 2,
            flexDirection: 'column',
            borderRadius: theme => `${theme.shape.borderRadiusExtraLarge}px`,
        }}
    >
        <StyledHeader>
            <EnvironmentIcon enabled={true} />
            <Box>
                <StringTruncator
                    text={`production`}
                    maxWidth="100"
                    maxLength={15}
                />
            </Box>
            <Box sx={{ ml: 'auto' }}>
                <PlaygroundResultChip
                    showIcon={false}
                    label={state === 'CREATED' ? 'Draft mode' : '???'}
                    enabled="unknown"
                />
            </Box>
        </StyledHeader>
        <Typography variant="body2" color="textSecondary">
            You request changes for these feature toggles:
        </Typography>
        {/* TODO: group by feature name */}
        {changes?.map(item => (
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
                    <ChangeItem {...item} />
                </Box>
            </Card>
        ))}
    </Box>
);
