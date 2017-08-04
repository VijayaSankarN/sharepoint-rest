(function() {
    angular.module('sharepoint.rest', []).factory('sharepointRESTService', sharepointRESTService)
    sharepointRESTService.$inject = ['$q', '$http'];

    function sharepointRESTService($q, $http) {
        var factoryUtil = {};

        // Get domain URL automatically
        factoryUtil.getDomainURL = function() {
            var deferred = $q.defer();

            var US_SP_data = {};
            US_SP_data.domain_url = sessionStorage.getItem('US_SPDomainUrl');
            US_SP_data.form_digest = sessionStorage.getItem('US_SPFormDigest');

            if(US_SP_data.domain_url == null || US_SP_data.form_digest == null) {
                $http({
                    url: "_api/contextinfo",
                    method: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-Type": "application/json;odata=verbose"
                    }
                }).success(function(result) {
                    US_SP_data.domain_url = result.d.GetContextWebInformation.WebFullUrl;
                    US_SP_data.form_digest = result.d.GetContextWebInformation.FormDigestValue;
                    sessionStorage.setItem('US_SPDomainUrl', US_SP_data.domain_url);
                    sessionStorage.setItem('US_SPFormDigest', US_SP_data.form_digest);
                    deferred.resolve(US_SP_data);
                });
            } else {
                deferred.resolve(US_SP_data);
            }

            return deferred.promise;
        }

        // HTTP GET
        factoryUtil.getListItems = function(list_name, filters) {
            var deferred = $q.defer();
            factoryUtil.getDomainURL().then(function(US_SP_data) {
                var domain_url = US_SP_data.domain_url;
                var url = domain_url + "/_api/web/lists/GetByTitle('" + list_name + "')/Items?";

                if (!angular.isUndefined(filters)) {
                    url += factoryUtil.build_filters(filters)
                }

                $http({
                    url: url,
                    method: "GET",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-Type": "application/json;odata=verbose"
                    }
                }).success(function(result) {
                    deferred.resolve(result.d.results);
                }).error(function(result, status) {
                    deferred.reject({
                        error: result,
                        status: status
                    });
                });
            });
            return deferred.promise;
        };

        // HTTP Create
        factoryUtil.createListItem = function(list_name, data) {
            data.__metadata = {
                "type": factoryUtil.getListName(list_name)
            };

            var deferred = $q.defer();
            factoryUtil.getDomainURL().then(function(US_SP_data) {
                var domain_url = US_SP_data.domain_url;
                var form_digest = US_SP_data.form_digest;
                var url = domain_url + "/_api/web/lists/getbytitle('" + list_name + "')/Items";

                $http({
                    url: url,
                    method: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": form_digest,
                        "content-Type": "application/json;odata=verbose"
                    },
                    data: JSON.stringify(data)
                }).success(function(result) {
                    deferred.resolve(result);
                }).error(function(result, status) {
                    deferred.reject({
                        error: result,
                        status: status
                    });
                });
            });
            return deferred.promise;
        };

        // HTTP Update
        factoryUtil.updateListItem = function(list_name, list_id, data) {
            data.__metadata = {
                "type": factoryUtil.getListName(list_name)
            };
            var deferred = $q.defer();
            factoryUtil.getDomainURL().then(function(US_SP_data) {
                var domain_url = US_SP_data.domain_url;
                var form_digest = US_SP_data.form_digest;
                var url = domain_url + "/_api/Web/Lists/getByTitle('" + list_name + "')/Items(" + list_id + ")";

                $http({
                    url: url,
                    method: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": form_digest,
                        "content-Type": "application/json;odata=verbose",
                        "X-HTTP-Method": "MERGE",
                        "If-Match": "*"
                    },
                    data: data
                }).success(function(result) {
                    deferred.resolve(result);
                }).error(function(result, status) {
                    deferred.reject({
                        error: result,
                        status: status
                    });
                });
            });
            return deferred.promise;
        };

        // HTTP Delete
        factoryUtil.deleteListItem = function(list_name, list_id) {
            var deferred = $q.defer();
            factoryUtil.getDomainURL().then(function(US_SP_data) {
                var domain_url = US_SP_data.domain_url;
                var form_digest = US_SP_data.form_digest;
                var url = domain_url + "/_api/Web/Lists/getByTitle('" + list_name + "')/Items(" + list_id + ")";

                $http({
                    url: url,
                    method: "DELETE",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": form_digest,
                        "IF-MATCH": "*"
                    }
                }).success(function(result) {
                    deferred.resolve(result);
                }).error(function(result, status) {
                    deferred.reject({
                        error: result,
                        status: status
                    });
                });
            });
            return deferred.promise;
        };

        // Generate List Name
        factoryUtil.getListName = function(name) {
            return "SP.Data." + name.charAt(0).toUpperCase() + name.replace('_', '_x005f_').replace(' ', '').slice(1) + "ListItem";
        };

        // Build filters
        factoryUtil.build_filters = function(filters) {
            var url_filter = [];
            url_filter[0] = []; // select
            url_filter[1] = []; // orderby
            url_filter[2] = []; // top
            url_filter[3] = []; // skip
            url_filter[4] = []; // filter And
            url_filter[5] = []; // expand
            url_filter[6] = []; // filter Or
            var url = [];
            if (!angular.isUndefined(filters.select)) {
                url_filter[0].push(filters.select.join());
            }
            if (!angular.isUndefined(filters.expand)) {
                angular.forEach(filters.expand, function(columns, field) {
                    angular.forEach(columns, function(value, key) {
                        url_filter[0].push(field + '/' + value);
                    });
                    url_filter[5].push(field);
                });
                url_filter[5] = '$expand=' + url_filter[5].join();
            }
            if (!angular.isUndefined(filters.orderby)) {
                url_filter[1] = '$orderby=' + filters.orderby;
            }
            if (!angular.isUndefined(filters.top)) {
                url_filter[2] = '$top=' + filters.top;
            }
            if (!angular.isUndefined(filters.skip)) {
                url_filter[3] = '$skip=' + filters.skip;
            }
            if (!angular.isUndefined(filters.filter)) {
                angular.forEach(filters.filter, function(value, field) {
                    url_filter[4].push('(' + field + ' ' + value[0] + ' \'' + value[1] + '\')');
                });
                url_filter[4] = '$filter=(' + url_filter[4].join(' and ') + ')';
            }
            if (!angular.isUndefined(filters.filterOr)) {
                angular.forEach(filters.filterOr, function(value, field) {
                    url_filter[6].push('(' + field + ' ' + value[0] + ' \'' + value[1] + '\')');
                });
                url_filter[6] = '$filter=(' + url_filter[6].join(' or ') + ')';
            }
            if (url_filter[0].length) url_filter[0] = '$select=' + url_filter[0].join();
            angular.forEach(url_filter, function(value, key) {
                if (url_filter[key].length) url.push(value);
            });
            return url.join('&');
        }
        return factoryUtil;
    }
})()