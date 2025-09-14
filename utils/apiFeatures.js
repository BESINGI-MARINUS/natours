class APIFeatures {
  constructor(query, queryObject) {
    //query=mongoose model, queryObject = req.query
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    const queryObj = { ...this.queryObject };
    const excludedFields = ['limit', 'sort', 'page', 'fields'];
    excludedFields.forEach((f) => delete queryObj[f]);

    // 1b. Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      const sortStr = this.queryObject.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limit() {
    if (this.queryObject.fields) {
      const fieldsStr = this.queryObject.fields.split(',').join(' ');
      this.query = this.query.select(fieldsStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryObject.page * 1 || 1;
    const limit = this.queryObject.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
