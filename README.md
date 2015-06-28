# lc-sdk-angular.js

This bower package provides a SDK for service discovery and resilient service invocation.


##Configuration parameters

```
{
  discoveryServers: [],
  services: {},
  servicesRefreshInterval: 0,
  timeout: 1000
}
```
* discoveryServers = list of discovery service URLs
* services = key/value of service URLs
* servicesRefreshInterval = Clear service discovery cache in ms
* timeout = HTTP request/response timeout