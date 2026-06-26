import Input from 'component/common/Input/Input';
import { FormField } from 'component/common/FormField/FormField';
import type { FC } from 'react';

interface IFeatureStrategyTitleProps {
    title: string;
    setTitle: (title: string) => void;
}

export const FeatureStrategyTitle: FC<IFeatureStrategyTitleProps> = ({
    title,
    setTitle,
}) => {
    return (
        <FormField
            label='Strategy title (optional)'
            description='What would you like to call this strategy?'
        >
            <Input
                label=''
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ width: '100%' }}
            />
        </FormField>
    );
};
