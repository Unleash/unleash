import PropTypes from 'prop-types';
function Secret({ value }) {

    return (
        <div>
           <span style={{ width: '250px', display: 'inline-block' }}>************************************</span>
        </div>
    );
}

Secret.propTypes = {
    value: PropTypes.string,
};

export default Secret;
