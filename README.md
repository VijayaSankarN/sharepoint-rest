# SharePoint REST with Angular

[![Build status](https://api.travis-ci.org/VijayaSankarN/sharepoint-rest.svg?branch=master)](https://travis-ci.org/VijayaSankarN/sharepoint-rest)
[![Code Smells](https://sonarcloud.io/api/badges/measure?key=sharepoint-rest&metric=code_smells)](https://sonarcloud.io/dashboard/index/sharepoint-rest)
[![Bugs](https://sonarcloud.io/api/badges/measure?key=sharepoint-rest&metric=bugs)](https://sonarcloud.io/dashboard/index/sharepoint-rest)
[![npm version](https://badge.fury.io/js/sharepoint-rest.svg)](https://badge.fury.io/js/sharepoint-rest)
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

## Available Methods

| Method | Purpose |
|--------|---------|
| `getListItems` | Get items from lists |
| `createListItem` | Create a new list item |
| `updateListItem` | Update an existing list item |
| `deleteListItem` | Delete an existing list item |
| `getFromURL` | Get response from the provided API URL |
| `getSiteURL` | Get the base URL of the site or sub-site |
| `getFormDigestValue` | Get the Form Digest Value for that session |

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
sharepointRESTService.deleteListItem('list_name', Id).then(function(response) {
  console.log('Response :', response);
});
```

### Getting from a URL
```Javascript
var url = "/_api/contextinfo";
sharepointRESTService.getFromURL(url).then(function(response) {
  console.log('Response :', response);
});
```

### Sending Email
```Javascript
sharepointRESTService.sendEmail(emailObj);
```

`emailObj` can hold following keys:
1. to 
2. cc
3. bcc
4. subject
5. body

***Note:*** `to`, `cc`, `bcc` keys can be hold 
- string value like `sankar.animation@gmail.com`
- array value like `[sankar.animation@gmail.com, sankar.animation@hotmail.com]`

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