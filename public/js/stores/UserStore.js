var _username;

//Ref: http://stackoverflow.com/questions/10730362/get-cookie-by-name
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
          c = c.substring(1,c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

var UserStore = {
    init: function init() {
      _username = readCookie("username");
    },

    set: function set(username) {
      _username=username;
      document.cookie="username="+_username+"; expires=Thu, 18 Dec 2099 12:00:00 UTC";
    },

    get: function get() {
      return _username;
    }
};

module.exports = UserStore;
