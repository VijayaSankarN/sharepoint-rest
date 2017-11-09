/**
 * Active User Factory
 *
 * User details to be maintained across the application
 *
 */
(function() {
    angular.module('app').factory('activeUser', activeUserFactory)
    activeUserFactory.$inject = ['$http', '$window', '$filter', '$rootScope', '$state', 'sharepointRESTService'];

    function activeUserFactory($http, $window, $filter, $rootScope, $state, SPService) {
        var sharedInfo = {};
        var url = {
            api_activeUser: "/_api/web/currentUser?$expand=groups",
            api_site_users: "/_api/web/siteUsers",
        };
        var defaultRoles = ["EM_Approvers", "EM_Managers", "EM_Administrators", "EM_Employees", "EM_Developers"];
        sharedInfo.user = {};

        function successHandler(response, cb) {
            var isDeveloper = false; // Developer flag
            sharedInfo.all = response;
            sharedInfo.user.groupsInfo = response.d.Groups.results; // User group
            sharedInfo.user.title = response.d.Title; // User Name
            sharedInfo.user.email = response.d.Email; // User Email
            sharedInfo.user.activeRole = '';
            sharedInfo.user.Id = response.d.Id;
            sharedInfo.user.userGroup = [];

            angular.forEach(sharedInfo.user.groupsInfo, function(value, key) {
                var role = value['Title'];
                if (defaultRoles.indexOf(role) != -1 && !isDeveloper) {
                    switch (role) {
                        case "EM_Developers":
                            // Adding Approver and Manager role (Highest available)
                            sharedInfo.user.userGroup = defaultRoles;
                            sharedInfo.user.userGroup.splice(2);
                            isDeveloper = true;
                            break;
                        case "EM_Employees":
                            // When an employee has one reporter under him, he will be a manager then
                            // Otherwise just an employee
                            sharedInfo.user.userGroup.push(sharedInfo.all.isManager ? "EM_Managers" : role);
                            break;
                        default:
                            sharedInfo.user.userGroup.push(role);
                    }
                }
            });
            // Remove Administrator role when the user has approver role assigned to them
            if (sharedInfo.user.userGroup.indexOf("EM_Approvers") != -1 && sharedInfo.user.userGroup.indexOf("EM_Administrators") != -1) {
                sharedInfo.user.userGroup.splice(sharedInfo.user.userGroup.indexOf("EM_Administrators"), 1);
            }
            if (sessionStorage.EM_activeRole && sessionStorage.EM_activeEmail == sharedInfo.user.email && sharedInfo.user.userGroup.indexOf(sessionStorage.EM_activeRole) !== -1) {
                sharedInfo.user.activeRole = sessionStorage.EM_activeRole;
            } else {
                sharedInfo.user.activeRole = sharedInfo.user.userGroup.length > 0 ? sharedInfo.user.userGroup[0] : '';
            }
            // User has no roles
            if (sharedInfo.user.userGroup.length == 0) {
                sharedInfo.user = null;
            }
            if (cb) cb();
        }
        sharedInfo.getData = function(cb, errorCb) {
            SPService.getFromURL(url.api_activeUser).then(function(activeUserResponse) {
                var filter = {
                    top: 1,
                    filter: {
                        'reportsTo': ['eq', activeUserResponse.d.Id],
                        'active': ['eq', 1]
                    },
                    expand: {
                        'employee':['Id', 'Title', 'Name'],
                    }
                };
                SPService.getListItems('employees', filter).then(function(employeeResponse) {
                    activeUserResponse.isManager = false;
                    if (employeeResponse.length) {
                        activeUserResponse.isManager = true;
                        activeUserResponse.employees = employeeResponse;
                    }
                    successHandler(activeUserResponse, cb);
                },function(er){
                console.log(er);
                    errorCb();
                });
            },function(er){
                console.log(er);
                errorCb();
            });
        }
        sharedInfo.getSiteUsers = function() {
            var filter = {
                select: ['Id', 'Email', 'Title']
            };
            SPService.getFromURL(url.api_site_users, filter).then(function(response) {
                sharedInfo.siteUsers = response.d.results;
                sharedInfo.siteUsers.keys = {};
                angular.forEach(sharedInfo.siteUsers, function(value, key) {
                    sharedInfo.siteUsers.keys[value.Id] = value.Title;
                });
            });
        }
        sharedInfo.getUserName = function() {
            return sharedInfo.user.title;
        }
        sharedInfo.getUserId = function() {
            return sharedInfo.user.Id;
        }
        sharedInfo.getUserEmail = function() {
            return sharedInfo.user.email;
        }
        sharedInfo.getUserGroup = function() {
            return sharedInfo.user.userGroup;
        }
        sharedInfo.getEmployees = function() {
            return sharedInfo.all.employees;
        }
        sharedInfo.setActiveRole = function(role) {
            sharedInfo.user.activeRole = role;
        }
        sharedInfo.getActiveRole = function() {
            return sharedInfo.user.activeRole;
        }
        return sharedInfo;
    }
})()