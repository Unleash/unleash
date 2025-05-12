import RolloutSlider from './RolloutSlider';
import LegacyRolloutSlider from './LegacyRolloutSlider';
import { useUiFlag } from 'hooks/useUiFlag';

interface IRolloutSliderProps {
    name: string;
    minLabel?: string;
    maxLabel?: string;
    value: number;
    onChange: (e: Event, newValue: number | number[]) => void;
    disabled?: boolean;
}

const ConditionalRolloutSlider = (props: IRolloutSliderProps) => {
    const addEditStrategy = useUiFlag('addEditStrategy');

    if (addEditStrategy) {
        return <RolloutSlider {...props} />;
    }

    return <LegacyRolloutSlider {...props} />;
};

export default ConditionalRolloutSlider;
