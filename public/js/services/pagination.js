/**
 * Pagination service
 *
 * Contains a few helpers for server side pagination.
 *
 * @note: Formatting and styleguide is taken from https://github.com/johnpapa/angular-styleguide#style-y033
 *              Check the Y052 rule.
 *
 * @param  {[type]} 'pagination'   [description]
 * @param  {[type]} ['app.models'] [description]
 * @return {[type]}                [description]
 */
angular.module('Pagination', [])
  .factory('pagination', pagination);

function pagination($location) {
  var paginationLimit = 10;

  var pagination = {
    generateQuery: generateQuery,
    paginate: paginate,
    getLimit: getPaginationLimit
  };

  return pagination;

  ////////////

  /**
   * Function will generate query object from the passed params and
   * will update the url.
   *
   * @param {object} query  object containing query properties
   * @return {object}       queryObject
   */
  function generateQuery(query) {

    // default pagination query params
    var queryDefaults = {
      limit: paginationLimit,
      page: 1
    };

    query = _.defaults(query, queryDefaults);

    if (query.searchText === '') {
      delete query.searchText;
    }

    // update the url
    $location.search(query);

    return $location.search();
  }

  /**
   * Function will get paginated results for the model using the passed data and
   * model name.
   *
   * @param  {object} queryData Object describing query params, usualy containing limit and page
   * @param  {string} modelName Name of the object to paginate
   * @return {promise}          Promise that will resolve with the queried results
   */
  function paginate(queryData, model) {
    if (!model) throw 'PaginationService: There is no model with name ' + model + ' specified inside models.';

    queryData.limit = queryData.limit || paginationLimit;
    queryData.page = queryData.page || 1;
    queryData.populate = queryData.populate || 0;
    queryData.searchText = queryData.searchText || '';

    return model.search(queryData).$promise;
  }

  /**
   * Returns the pagination limit for a page
   *
   * @return {Number} Number of the paginated results for a page
   */
  function getPaginationLimit() {
    return paginationLimit;
  }
}
