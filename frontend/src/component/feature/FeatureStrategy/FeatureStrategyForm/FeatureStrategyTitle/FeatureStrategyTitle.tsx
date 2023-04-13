import { Box, Typography } from '@mui/material';
import Input from 'component/common/Input/Input';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { VFC } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IFeatureStrategyTitleProps {}

export const FeatureStrategyTitle: VFC<IFeatureStrategyTitleProps> = () => {
    const { uiConfig } = useUiConfig();

    if (!uiConfig.flags.strategyTitle) {
        return null;
    }

    return (
        <Box sx={{ paddingBottom: theme => theme.spacing(2) }}>
            <Typography
                sx={{
                    paddingBottom: theme => theme.spacing(2),
                }}
            >
                What would you like to call this strategy? (optional)
            </Typography>
            <Input
                label="Strategy title"
                id="groupId-input"
                onChange={() => {}}
                value={'test'}
                // value={parseParameterString(parameters.groupId)}
                // onChange={e => onUpdate('groupId')(e.target.value)}
                // data-testid={FLEXIBLE_STRATEGY_GROUP_ID}
            />
        </Box>
    );
};
