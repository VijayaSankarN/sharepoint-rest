# SharePoint REST with Angular
This AngularJS service helps to create a list item, get items that are already created, update or delete an item from the list using functions that automatically builds REST API query. This service also has a filter builder which helps to build OData query for filtering and fetching desired items from the list.

## Example

### Getting list items
```Javascript
sharepointRESTService.getListItems(domain_url, 'list_name', filter).then(function(response) {
  console.log('Response :', response);
});
```

### Creating a list item
```Javascript
sharepointRESTService.createListItem(domain_url, 'list_name', data).then(function(response) {
  console.log('Response :', response);
});
```

### Updating a list item
```Javascript
sharepointRESTService.updateListItem(domain_url, 'list_name', data.Id, data).then(function(response) {
  console.log('Response :', response);
});
```

### Deleting a list Item
```Javascript
sharepointRESTService.updateListItem(domain_url, 'list_name', Id).then(function(response) {
  console.log('Response :', response);
});
```
