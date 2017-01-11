# Client Specification 1.0

This document describes the client contract. 

## The basics
All client implementations should strive to have a simple and consistent user API. 
It should be a simple method, called isEnabled, to check if a feature toggle is enabled 
or not. The method should return a `boolean` value, true or false. 

```
unleash.isEnabled("myAwesomeToggle")
```

The basic `isEnabled` method should also accept a default value. This should be used if 
the client does not know anything about that that toggle name. If the user does not specify
a default value, false should be returned for unknown feature toggles. 

Example:

``` 
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

A simple demo of the isEnable function in JavaScript-style (most implementation will probalby be more functional):

```javascript
function isEnabled(name, defaultValue) {
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
            if(strategyImpl.isEnabled) {
                return true;
            }
        }
        return false;
    }

}

```


## Actication Strategies
Activation strategies are defined and confured in the unleash-service. It is up to the client
to provide the actual implementation of each actication strategy. Client implementation should 
also provide a defined interface to make it easier for the user to implement their own 
activation strategies, and register those in the unleash client. 


## Fetching feature toggles (polling)
The client implementation should fetch toggles in the background, as regular polling. 
In thread based environment (e.g. Java) this needs to be done on a sparate thread. 
The default poll interval should be **15 seconds**, and it should be configurable. 


## Client registration
Client implementation should at initialization register with the unleash-server. 
The should send a registration as specified in the [api documentation](https://github.com/Unleash/unleash/blob/master/docs/api/metrics-api.md#client-registration).
The registration must include all fields specified.




## Metrics

## Backup feature toggles


