// __mocks__/react-modal.js
const Modal = require('react-modal');

const oldFn = Modal.setAppElement;
Modal.setAppElement = element => {
    if (element === '#app') {
        // otherwise it will throw aria warnings.
        return oldFn(document.createElement('div'));
    }
    oldFn(element);
};
module.exports = Modal;
