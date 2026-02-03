exports.create = async ({ model, data }) => {
  try {
    return model.create(data);
  } catch (error) {
    
    throw new Error("Error creating record");
  }
};

exports.pagenate = async ({
  model,
  query = {},
  limit = 10,
  page = 1,
  projection,
  populateFields = [],
}) => {
  limit = parseInt(limit, 10);
  page = parseInt(page, 10);
  const offset = limit * (page - 1);

  try {
    const queryBuilder = model.find(query, projection);
    if (populateFields.length > 0) queryBuilder.populate(populateFields);

    const data = await queryBuilder.skip(offset).limit(limit);
    const totalCount = await model.countDocuments(query);
    return {
      data,
      totalCount,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalCount / limit,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    
    throw new Error("Error during pagination");
  }
};



exports.findAllWithoutPagination = async ({
  model,
  query = {},
  projection,
  populateFields = [],
}) => {
  try {
    const queryBuilder = model.find(query, projection);
    if (populateFields.length > 0) queryBuilder.populate(populateFields);

    const data = await queryBuilder;
    const totalCount = await model.countDocuments(query);
    return {
      data,
      totalCount,
    };
  } catch (error) {
    
    throw new Error("Error while fetching data without pagination");
  }
};


exports.findById = async ({ model, id, populateFields = [] }) => {
  try {
    const query = model.findById(id);
    if (populateFields.length > 0) query.populate(populateFields);
    const result = await query;
    // return result ? result : new Error(`Record with ID ${id} not found`);
    return result ? result : null; 
  } catch (error) {
    
    throw new Error("Error fetching single record By Id");
  }
};

exports.findOne = async ({ model, email, populateFields = [] }) => {
  try {
    let query = model.findOne({ email });
    if (populateFields.length > 0) query = query.populate(populateFields);
    const result = await query;
    return result ? result : new Error(`Record with mail ${email} not found`);
  } catch (error) {
    throw new Error("Error fetching single record By Email");
  }
};

exports.findByIdAndUpdate = async ({ model, id, updateData }) => {
  try {
    const result = await model.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return result ? result : null;
  } catch ( error )
  {
    
    throw new Error("Error updating record");
  }
};


