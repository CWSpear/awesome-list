# Awesome List

*More detailed description forthcoming. Until then... here's example HTML that uses all of the features in this suite of directives:*

```html
<!-- "items" is the items in the full list, "displayed" is the items it'll show after filtering, sorting and paging -->
<awesome-list items="users" displayed="displayedUsers">
    <div class="pre-table-header">
        <!-- input for search placed here -->
        <awesome-search search-fields="['roles[0].name', 'name', 'email']"></awesome-search>
 
        <button class="btn btn-primary" ui-sref=".user({ id: 'new' })">Add User</button>
    </div>
 
    <table class="table">
        <thead>
        <tr>
            <th awesome-sort="name">Name</th>
            <th awesome-sort="email">Email</th>
            <!-- awesomeSort can handle complex sort keys -->
            <th awesome-sort="roles[0].name">User Role</th>
        </tr>
        </thead>
        <tbody>
        <!-- note we're iterating the value of "displayed" attr from awesome-list -->
        <tr class="selectable-row" ui-sref=".user({ id: user.id })" ng-repeat="user in displayedUsers">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.roles[0].name }}</td>
        </tr>
        </tbody>
    </table>
 
    <!-- single tag pagination! (opts forthcoming) -->
    <awesome-pagination></awesome-pagination>
 
</awesome-list>
```
