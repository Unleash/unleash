# Client Specification 1.0

This document attempts to guide developers in implementing a Unleash Client SDK. 

## System Overview
Unleash is comprised of three parts:

- **Unleash API** - The service holding all feature toggles and their configurations. Configurations declare which activation strategies to use and which parameters they should get.
- **Unleash UI** - The dashboard used to manage feature toggles, define new strategies, look at metrics, etc.
- **Unleash SDK** - Used by clients to check if a feature is enabled or disabled. The SDK also collects metrics and sends them to the Unleash API. Activation Strategies are also implemented in the SDK. Unleash currently provides official SDKs for Java and Node.js

![system_overview](https://raw.githubusercontent.com/Unleash/unleash/master/docs/assets/unleash-diagram.png "System Overview")

In order to be super fast, the client SDK caches all feature toggles and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a toggle is on or off because it is just a simple function operating on local state, without the need to poll data from the database.

## The Basics
All client implementations should strive to have a simple and consistent user API. 
It should be a simple method, called isEnabled, to check if a feature toggle is enabled 
or not. The method should return a `boolean` value, true or false. 

```javascript
unleash.isEnabled("myAwesomeToggle")
```

The basic `isEnabled` method should also accept a default value. This should be used if 
the client does not know anything about that that toggle name. If the user does not specify
a default value, false should be returned for unknown feature toggles. 

**Calling unleash with default value:**

```javascript 
boolean value = unleash.isEnabled("unknownFeatureToggle", false);
//value==false because default value was used. 
```



### Implementation of isEnabled
A feature toggle is defined as: 

```json
{
      "name": "Feature.B",
      "description": "lorem ipsum",
      "enabled": true,
      "strategies": [
        {
          "name": "ActiveForUserWithId",
          "parameters": {
            "userIdList": "123,221,998"
          }
        },
        {
          "name": "GradualRolloutRandom",
          "parameters": {
            "percentage": "10"
          }
        }
      ],
      "strategy": "ActiveForUserWithId",
      "parameters": {
        "userIdList": "123,221,998"
      }
    }
```

A simple demo of the isEnable function in JavaScript-style (most implementation will probably be more functional):

```javascript
function isEnabled(name, unleashContext = {}, defaultValue = false) {
    const toggle = toggleRepository.get(name);
    let enabled = false;
    
    if ( !toggle ) {
        return defaultValue;
    } else if ( ! toggle.isEnabled) {
        return false;
    } else {
        for(let i=0;i<toggle.strategies.length;i++) {
            let strategyDef = toggle.strategies[i];
            let strategyImpl = strategyImplRepository.get(strategyDef.name);
            if(strategyImpl.isEnabled(toggle.parameters, unleashContext)) {
                return true;
            }
        }
        return false;
    }

}

```


## Activation Strategies
Activation strategies are defined and configured in the unleash-service. It is up to the client
to provide the actual implementation of each activation strategy. 

Unleash also ships with a few built-in strategies and it is expected that client SDK's implement 
these. Read more about these [activation strategies](activation-strategies.md). For the built-in
strategies to work as expected the client should also allow the user to define a 
[unleash-context](unleash-context.md). The context should be possible to pass in as part of 
the `isEnabled` call.

### Extension points
Client implementation should  also provide a defined interface to make it easier for 
the user to implement their own activation strategies, and register those in the unleash client. 


## Fetching feature toggles (polling)
The client implementation should fetch toggles in the background, as regular polling. 
In thread based environment (e.g. Java) this needs to be done on a separate thread. 
The default poll interval should be **15 seconds**, and it should be configurable. 


## Client registration
Client implementation should at initialization register with the unleash-server. 
The should send a registration as specified in the [api documentation](api/metrics-api.md#client-registration).
The registration must include all fields specified.


## Metrics
Clients are expected to send metrics back to Unleash API at regular intervals. The metrics is a list 
of used toggles and how many times they evaluated to *yes* or *no* in the current period. 
Read more about how to send the metrics in the [metrics-api](api/metrics-api.md) documentation.


## Backup Feature Toggles
The SDK also persists the latest known state to a local file at the instance where the client is running. 
It will persist a local copy every time the client detects changes from the API. Having a local backup of 
the latest known state minimises the consequence of clients not being able to to talk to Unleash API at 
startup. This is required because network is unreliable.


