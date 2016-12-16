angular.module('teachur').filter('pagination', function() {
    return function(items, page, limit) {
        page = page || 1;

        if (!items) return items;

        return items.slice((page - 1) * limit, page * limit);
    };
});