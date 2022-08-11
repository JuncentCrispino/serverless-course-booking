/* eslint-disable no-param-reassign */
import dayjs from 'dayjs';
const search = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  schema.statics.search = async function (filter, options) {

    const limit = options.limit && parseInt(options.limit, 10) > 0
      ? parseInt(options.limit, 10)
      : 10;
    const page = options.page && parseInt(options.page, 10) > 0
      ? parseInt(options.page, 10)
      : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.aggregate(filter).count('total').exec();
    let docsPromise = this.aggregate(filter).allowDiskUse(true).skip(skip).limit(limit);
    // let docsPromise = this.aggregate(filter).allowDiskUse(true).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a, b) => ({ path: b, populate: a }))
        );
      });
    }

    docsPromise = docsPromise.exec();
    return Promise.all([countPromise, docsPromise]).then((values) => {
      let [totalResults, results] = values;
      if (totalResults.length === 0) {
        totalResults = 0;
      } else {
        totalResults = totalResults[0].total;
      }
      const totalPages = Math.ceil(totalResults / limit);
      results.map(res => {
        res.createdAt = dayjs(res.createdAt).format('MMMM D, YYYY h:mm A');
        res.updatedAt = dayjs(res.updatedAt).format('MMMM D, YYYY h:mm A');
        return res;
      });
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults: totalResults
      };
      return Promise.resolve(result);
    });
  };
};

export default search;