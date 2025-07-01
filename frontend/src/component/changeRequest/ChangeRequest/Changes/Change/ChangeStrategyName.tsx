import type { FC } from 'react';
import { formatStrategyName } from 'utils/strategyNames';
import { styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';
import { Truncator } from 'component/common/Truncator/Truncator.tsx';

type ChangeStrategyNameProps = {
    name: string;
    title?: string;
    previousTitle?: string;
};

const Truncated = styled('span')(() => ({
    ...textTruncated,
    maxWidth: 500,
}));

export const ChangeStrategyName: FC<ChangeStrategyNameProps> = ({
    name,
    title,
    previousTitle,
}) => {
    return (
        <Truncated>
            <Truncator component='span'>{formatStrategyName(name)}</Truncator>
            <NameWithChangeInfo newName={title} previousName={previousTitle} />
        </Truncated>
    );
};
