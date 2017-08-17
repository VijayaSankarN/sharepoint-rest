angular.module('myApp', ['sharepoint.rest'])
.controller('myController', function($scope, sharepointRESTService) {

  var filter = {
    select: ['Id'],
    top: 5
  };

  var data = {
    Id: 1,
    name: 'James',
    email: 'sankar.animation@gmail.com'
  }

  var url = "/_api/contextinfo";

  // Getting list items
  sharepointRESTService.getListItems('list_name', filter).then(function(response) {
    console.log('Response :', response);
  });

  // Creating a list item
  sharepointRESTService.createListItem('list_name', data).then(function(response) {
    console.log('Response :', response);
  });

  // Updating a list item
  sharepointRESTService.updateListItem('list_name', data.Id, data).then(function(response) {
    console.log('Response :', response);
  });

  // Deleting a list Item
  sharepointRESTService.deleteListItem('list_name', Id).then(function(response) {
    console.log('Response :', response);
  });

  // Getting response from a URL
  sharepointRESTService.getFromURL(url).then(function(response) {
    console.log('Response :', response);
  });

});