# Awesome List

*More detailed description forthcoming. Until then... [here's a demo](http://cwspear.github.io/awesome-list/) and here's an example HTML that uses all of the features in this suite of directives:*

```html
<!-- "items" is the items in the full list, "displayed" is the items it'll show after filtering, sorting and paging -->
<awesome-list items="users" displayed="displayedUsers" initial-sort="name">
    <div class="pre-table-header row">
        <div class="col-md-4">
            <div class="form-group">
                <!-- input for search placed here -->
                <awesome-search class="form-control"
                                search-fields="['roles[0].name', 'name', 'email']"></awesome-search>
            </div>
        </div>
    </div>

    <table class="table table-striped table-hover">
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
        <tr class="selectable-row" ng-repeat="user in displayedUsers">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.roles[0].name }}</td>
        </tr>
        </tbody>
    </table>

    <!-- single tag pagination! (opts forthcoming) -->
    <awesome-pagination chomp="10" class="pagination pagination-sm"></awesome-pagination>
</awesome-list>
```
