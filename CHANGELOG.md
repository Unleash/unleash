# Changelog

## 2.0.0 (Januar 2017)
- Support multiple strategies. This makes it easy to use multiple activation strategies in combination.
- Client metrics. Gives details about what toggles a specific client application uses, how many times a toggle was evaluated to true / false. Everything presented in the UI. 
- Client registration. This gives insight about connected clients, instances, strategies they support. 
- Client Application overview. Based on metrics and client registrations.
- Publish unleash-server to npm. 
- Provide Prometheus endpoint for service metrics (response times, memory usage, etc).
- A lot of bug-fixes (check commit history and issues for reference)
- Unleash-frontend as a separate repo: https://github.com/Unleash/unleash-frontend. Total rewrite of UI using react + redux + material desing. 
- Unleash moved to it’s own organization: https://github.com/Unleash making it more open and allow everyone to contribute. 
- Unleash-docker as a separate module: https://github.com/Unleash/unleash-docker 
- Unleash binary, making it easy to install and use Unleash as a service. 
- Removed all config/tuning that was specific to FINN.no usage of Unleash. 


## 1.0.0 (Januar 2014)
- Initial public release

