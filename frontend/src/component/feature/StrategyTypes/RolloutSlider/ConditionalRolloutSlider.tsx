import RolloutSlider from './RolloutSlider.tsx';

interface IRolloutSliderProps {
    name: string;
    minLabel?: string;
    maxLabel?: string;
    value: number;
    onChange: (e: Event, newValue: number | number[]) => void;
    disabled?: boolean;
}

const ConditionalRolloutSlider = (props: IRolloutSliderProps) => {
    return <RolloutSlider {...props} />;
};

export default ConditionalRolloutSlider;
