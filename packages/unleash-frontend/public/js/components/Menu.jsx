'use strict';
const React = require('react');
const User = require('./User');

const Menu = React.createClass({
    render() {
        return (
            <div className="topbar mbl">
            <div className="container">
            <div className="page">
                <div className="fright-ht768">
                <User />
                </div>
                <div className="nav-level1 h4">
                <a href="#" className="homelink pln">
                    <span className="topbar-nav-svg-home">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53M
                                y5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MjcuNDExIiBoZWlnaHQ9IjE2OS4z
                                OTgiIHZpZXdCb3g9IjAgMCA1MjcuNDExIDE2OS4zOTgiPjxwYXRoIGZpbGw
                                9IiNmZmYiIGQ9Ik00NjguNTA3IDBoLTI1Ni4xODdjLTIxLjcwNyAwLTQwLj
                                Y5NSAxMS44MTItNTAuOTEyIDI5LjMzNy0xMC4yMTYtMTcuNTI1LTI5LjIwN
                                C0yOS4zMzctNTAuOTExLTI5LjMzN2gtNTEuNTk1Yy0zMi40NzkgMC01OC45
                                MDIgMjYuNDI1LTU4LjkwMiA1OC45MDV2NTEuNTg3YzAgMzIuNDgxIDI2LjQ
                                yMyA1OC45MDYgNTguOTAyIDU4LjkwNmg0MDkuNjA1YzMyLjQ3OSAwIDU4Lj
                                kwMy0yNi40MjUgNTguOTAzLTU4LjkwNnYtNTEuNTg3Yy4wMDEtMzIuNDgtM
                                jYuNDIzLTU4LjkwNS01OC45MDMtNTguOTA1eiIvPjxwYXRoIGZpbGw9IiMw
                                OWYiIGQ9Ik00NjguNTA3IDE1My4zODNjMjMuNjg3IDAgNDIuODg4LTE5LjE
                                5OSA0Mi44ODgtNDIuODl2LTUxLjU4OGMwLTIzLjY5MS0xOS4yMDEtNDIuOD
                                ktNDIuODg4LTQyLjg5aC0yNTYuMTg3Yy0yMy42ODYgMC00Mi44ODcgMTkuM
                                Tk4LTQyLjg4NyA0Mi44OXY5NC40NzhoMjk5LjA3NHoiLz48cGF0aCBmaWxs
                                PSIjMDA2IiBkPSJNMTUzLjM4NCAxNTMuMzgzdi05NC40NzhjMC0yMy42OTE
                                tMTkuMjAxLTQyLjg5LTQyLjg4Ny00Mi44OWgtNTEuNTk1Yy0yMy42ODYgMC
                                00Mi44ODcgMTkuMTk4LTQyLjg4NyA0Mi44OXY1MS41ODdjMCAyMy42OTEgM
                                TkuMjAxIDQyLjg5IDQyLjg4NyA0Mi44OWg5NC40ODJ6Ii8%2BPHJlY3QgeD
                                0iMzIwLjE1NiIgeT0iNzUuMjc1IiBmaWxsPSIjZmZmIiB3aWR0aD0iMTkuN
                                jIxIiBoZWlnaHQ9IjUzLjIxMSIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0y
                                NjIuOTEyIDg2LjI4MWMwLTUuNTI5IDMuODEzLTExLjAwNiAxMy4wNjktMTE
                                uMDA2aDI4LjQyMXYxNS42MTNoLTE4LjYxMmMtMi40OTggMC0zLjI1NS45OT
                                ItMy4yNTUgMi42NjR2Ny40NzJoMjEuODY3djE1LjYxaC0yMS44Njd2MTEuO
                                DUyaC0xOS42MjN2LTQyLjIwNXpNMzc1LjE2NSA5MS4wOTloMTAuMzk5YzIu
                                NDA5IDAgMy4yNDYuODMyIDMuMjQ2IDMuMjM1bC0uMDA4IDM0LjE1MmgxOS4
                                2MzJ2LTQxLjk5NmMwLTUuNTI3LTMuODE1LTExLjAwNC0xMy4wNjktMTEuMD
                                A0aC0zOS44MjRsLS4wMSA1M2gxOS42MzR2LTM3LjM4N3pNNDQyLjcxOSA5M
                                S4wOTloMTAuNGMyLjQwOCAwIDMuMjQ1LjgzMiAzLjI0NSAzLjIzNWwtLjAw
                                OSAzNC4xNTJoMTkuNjM0di00MS45OTZjMC01LjUyNy0zLjgxNS0xMS4wMDQ
                                tMTMuMDctMTEuMDA0aC0zOS44MjNsLS4wMSA1M2gxOS42MzN2LTM3LjM4N3
                                oiLz48L3N2Zz4%3D" width="106" height="34" />
                    </span>

                    <span
                    className="topbar-nav-svg-caption caption showbydefault hide-lt900">
                    unleash admin
                </span>
                </a>
                {this.props.children}
                </div>
            </div>
            </div>
            </div>
        );
    },
});

module.exports = Menu;
