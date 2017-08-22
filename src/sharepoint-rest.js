(function() {
    angular.module('sharepoint.rest', []).factory('sharepointRESTService', sharepointRESTService)
    sharepointRESTService.$inject = ['$q', '$http', '$location'];

    function sharepointRESTService($q, $http, $location) {
        var factoryUtil = {};

        // Generate URL and Form Digest Value
        factoryUtil.generateSPData = function() {
            var deferred = $q.defer();

            $http({
                url: "_api/contextinfo",
                method: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-Type": "application/json;odata=verbose"
                }
            }).success(function(result) {
                var SP_data = {};
                SP_data.site_url = result.d.GetContextWebInformation.WebFullUrl;
                SP_data.form_digest = result.d.GetContextWebInformation.FormDigestValue;
                sessionStorage.setItem('SPSiteUrl', SP_data.site_url);
                sessionStorage.setItem('SPFormDigest', SP_data.form_digest);
                deferred.resolve(SP_data);
            });

            return deferred.promise;
        }

        // Get URL and Form Digest Value
        factoryUtil.getSPData = function() {
            var deferred = $q.defer();
            var SP_data = {};
            SP_data.site_url = sessionStorage.getItem('SPSiteUrl');
            SP_data.form_digest = sessionStorage.getItem('SPFormDigest');

            if(SP_data.site_url == null || SP_data.form_digest == null || $location.absUrl().indexOf(SP_data.site_url) < 0) {
                factoryUtil.generateSPData().then(function(SP_data) {
                    deferred.resolve(SP_data);
                });
            } else {
                deferred.resolve(SP_data);
            }

            return deferred.promise;
        }

        // Get Site URL
        factoryUtil.getSiteURL = function() {
            var deferred = $q.defer();
            var site_url = sessionStorage.getItem('SPSiteUrl');

            if(site_url == null || $location.absUrl().indexOf(site_url) < 0) {
                factoryUtil.generateSPData().then(function(SP_data) {
                    deferred.resolve(SP_data.site_url);
                });
            } else {
                deferred.resolve(site_url);
            }

            return deferred.promise;
        }

        // Get Form Digest Value
        factoryUtil.getFormDigestValue = function() {
            var deferred = $q.defer();
            var form_digest = sessionStorage.getItem('SPFormDigest');

            if(form_digest == null) {
                factoryUtil.generateSPData().then(function(SP_data) {
                    deferred.resolve(SP_data.form_digest);
                });
            } else {
                deferred.resolve(form_digest);
            }

            return deferred.promise;
        }

        // HTTP Get from URL
        factoryUtil.getFromURL = function(get_url, filters) {
            var deferred = $q.defer();

            factoryUtil.getSiteURL().then(function(site_url) {
                var url = site_url + get_url;

                if (!angular.isUndefined(filters)) {
                    url += "?" + factoryUtil.build_filters(filters)
                }

                $http({
                    url: url,
                    method: "GET",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-Type": "application/json;odata=verbose"
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

        // HTTP Get
        factoryUtil.getListItems = function(list_name, filters) {
            var deferred = $q.defer();

            factoryUtil.getSiteURL().then(function(site_url) {
                var url = site_url + "/_api/web/lists/GetByTitle('" + list_name + "')/Items";

                if (!angular.isUndefined(filters)) {
                    url += "?" + factoryUtil.build_filters(filters)
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
        factoryUtil.createListItem = function(list_name, data, def) {
            data.__metadata = {
                "type": factoryUtil.getListName(list_name)
            };
            var deferred = def || $q.defer();

            factoryUtil.getSPData().then(function(SP_data) {
                var site_url = SP_data.site_url;
                var form_digest = SP_data.form_digest;
                var url = site_url + "/_api/web/lists/getbytitle('" + list_name + "')/Items";

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
                    if(status == 403) {
                        factoryUtil.generateSPData().then(function() {
                            factoryUtil.createListItem(list_name, data, deferred);
                        });
                    } else {
                        deferred.reject({
                            error: result,
                            status: status
                        });
                    }
                });
            });

            return deferred.promise;
        };

        // HTTP Update
        factoryUtil.updateListItem = function(list_name, list_id, data, def) {
            data.__metadata = {
                "type": factoryUtil.getListName(list_name)
            };
            var deferred = def || $q.defer();

            factoryUtil.getSPData().then(function(SP_data) {
                var site_url = SP_data.site_url;
                var form_digest = SP_data.form_digest;
                var url = site_url + "/_api/Web/Lists/getByTitle('" + list_name + "')/Items(" + list_id + ")";

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
                    if(status == 403) {
                        factoryUtil.generateSPData().then(function() {
                            factoryUtil.updateListItem(list_name, list_id, data, deferred);
                        });
                    } else {
                        deferred.reject({
                            error: result,
                            status: status
                        });
                    }
                });
            });

            return deferred.promise;
        };

        // HTTP Delete
        factoryUtil.deleteListItem = function(list_name, list_id, def) {
            var deferred = def || $q.defer();

            factoryUtil.getSPData().then(function(SP_data) {
                var site_url = SP_data.site_url;
                var form_digest = SP_data.form_digest;
                var url = site_url + "/_api/Web/Lists/getByTitle('" + list_name + "')/Items(" + list_id + ")";

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
                    if(status == 403) {
                        factoryUtil.generateSPData().then(function() {
                            factoryUtil.deleteListItem(list_name, list_id, deferred);
                        });
                    } else {
                        deferred.reject({
                            error: result,
                            status: status
                        });
                    }
                });
            });

            return deferred.promise;
        };

        // Generate List Name
        factoryUtil.getListName = function(name) {
            return "SP.Data." + name.charAt(0).toUpperCase() + name.split('_').join('_x005f_').split(' ').join('').slice(1) + "ListItem";
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