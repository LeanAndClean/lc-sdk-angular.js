angular
  .module('lcSDK', [])
  .provider('lcServiceClient', function () {

    this.$get = function ($http, $q) {
      var config = {
        discoveryServers: [],
        services: {},
        servicesRefreshInterval: 0,
        timeout: 1000
      };


      return function (cfg) {
        angular.extend(config, cfg);

        if(config.servicesRefreshInterval){
          setInterval(function(){
            config.services = {};
          }, config.servicesRefreshInterval);
        }

        return {
          get: get,
          post: post,
          put: put,
          delete: del
        };
      };

      function get(serviceName, path) {
        return ajax('get', serviceName, path);
      }

      function post(serviceName, path, value) {
        return ajax('post', serviceName, path, value);
      }

      function put(serviceName, path, value) {
        return ajax('put', serviceName, path, value);
      }

      function del(serviceName, path) {
        return ajax('delete', serviceName, path);
      }

      function ajax(method, serviceName, path, value) {
        return getServiceUrls(serviceName).then(function (urls) {
          if (!urls.length) throw new Error('No endpoint configured for service ' + serviceName);

          // Map url to a list of operations
          var funcs = urls.map(function (url) {
            return $http[method].bind($http, 'http://' + url + path, value, { timeout: config.timeout });
          });

          return invokeUntilResolved(funcs);
        });
      }

      function getServiceUrls(serviceName) {
        if (config.services[serviceName]) return $q.when(config.services[serviceName]);

        var funcs = config.discoveryServers.map(function (discoveryServer) {
          return $http.get.bind($http, discoveryServer + '/v1/catalog/service/' + serviceName);
        });

        return invokeUntilResolved(funcs).then(function (result) {
          var serviceUrls = result.data.map(function (itm) {
            return itm.Address + ':' + itm.ServicePort;
          });

          config.services[serviceName] = serviceUrls;
          return serviceUrls;
        });
      }

      function invokeUntilResolved(funcs) {
        // Invoke functions that return promises sequentially
        // and return the first resolved promise.
        // Invoke the next function only when the return value
        // of the previous function is a rejected promise.
        return funcs.reduce(function (previous, next) {
          return previous.catch(next);
        }, $q.reject(new Error('No function specified')));
      }

    };
});
