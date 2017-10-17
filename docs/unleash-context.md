# Unleash Context

In order to standardise a few activation strategies we also needed to 
standardise a unleash context, which contains some fields that varies 
per requests, needed to implement the activation strategies. 

The unleash context is defined by these fields:

- userId: String,
- sessionId: String,
- remoteAddress: String,
- properties: Map<String, String>

All fields are optional, but if they are not set you will not be able to use 
certain activation strategies. 

E.g. the userWithId-strategy obviously depends on the userId field. 

The properties field is more generic and can be used to provide more abritary 
data to the strategies. A common usage is to add more metadata, e.g. that the 
current user is a beta user, and thus the betaUser-strategy will use this info
in its implementation.
