import StrategyParameter from './StrategyParameter/StrategyParameter';
import PropTypes from 'prop-types';

function gerArrayWithEntries(num) {
    return Array.from(Array(num));
}

const StrategyParameters = ({ input = [], count = 0, updateParameter }) => (
    <div>
        {gerArrayWithEntries(count).map((v, i) => (
            <StrategyParameter
                key={i}
                set={v => updateParameter(i, v, true)}
                index={i}
                input={input[i]}
            />
        ))}
    </div>
);

StrategyParameters.propTypes = {
    input: PropTypes.array,
    updateParameter: PropTypes.func.isRequired,
    count: PropTypes.number,
};

export default StrategyParameters;
