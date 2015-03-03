var Reflux = require("reflux");
module.exports = {
  create:  Reflux.createAction({ asyncResult: true }),
  update:  Reflux.createAction({ asyncResult: true }),
  archive: Reflux.createAction({ asyncResult: true }),
  revive:  Reflux.createAction({ asyncResult: true })
};
