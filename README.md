# SharePoint REST with Angular

[![Build status](https://api.travis-ci.org/VijayaSankarN/sharepoint-rest.svg?branch=master)](https://travis-ci.org/VijayaSankarN/sharepoint-rest) 
[![Quality Gate](https://sonarcloud.io/api/badges/gate?key=sharepoint-rest)](https://sonarcloud.io/dashboard/index/sharepoint-rest)
[![npm version](https://badge.fury.io/js/sharepoint-rest.svg)](https://badge.fury.io/js/sharepoint-rest)
[![Bower version](https://badge.fury.io/bo/sharepoint-rest.svg)](https://badge.fury.io/bo/sharepoint-rest)
[![Downloads](https://img.shields.io/npm/dm/sharepoint-rest.svg)](https://www.npmjs.com/package/sharepoint-rest)
[![Total Downloads](https://img.shields.io/npm/dt/sharepoint-rest.svg)](https://www.npmjs.com/package/sharepoint-rest)

This AngularJS service helps to create a list item, get items that are already created, update or delete an item from the list using functions that automatically builds REST API query. This service also has a filter builder which helps to build OData query for filtering and fetching desired items from the list.

## Install

### NPM
```
npm install sharepoint-rest
```

### Bower
```
bower install sharepoint-rest
```

## Example

### Getting list items
```Javascript
sharepointRESTService.getListItems('list_name', filter).then(function(response) {
  console.log('Response :', response);
});
```

### Creating a list item
```Javascript
sharepointRESTService.createListItem('list_name', data).then(function(response) {
  console.log('Response :', response);
});
```

### Updating a list item
```Javascript
sharepointRESTService.updateListItem('list_name', data.Id, data).then(function(response) {
  console.log('Response :', response);
});
```

### Deleting a list Item
```Javascript
sharepointRESTService.updateListItem('list_name', Id).then(function(response) {
  console.log('Response :', response);
});
```

### Building filters
Following keys can be used to build OData query:
```Javascript
var filter = {
    select: ['field_name', 'id'],
    expand: {
        'list_name': ['field_name1', 'field_name2']
    },
    orderby: 'field_name asc/desc',
    filter: {
        'field_name': ['lt/gt/eq/ne', 'value']
    },
    top : 5,
    skip : 5
};
```
