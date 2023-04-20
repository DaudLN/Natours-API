const _ = require('lodash');
const status = require('statuses');
const APIFeatures = require('../util/APIFeatures');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

// Delete document
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError(status('Not Found'), `No document found`));
    }
    res.status(status('No Content')).json({
      status: 'Success',
    });
  });

// Update document
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError(status('Not Found'), `No document found`));
    }
    res.status(status('OK')).json({
      status: 'Success',
      data: { data: document },
    });
  });

exports.createOne = (Model, body) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(_.pick(req.body, body));
    res.status(status('Created')).json({
      Status: 'Success',
      data: { data: doc },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;
    if (!document) {
      return next(new AppError(status('Not Found'), 'No document found'));
    }
    res.status(status('OK')).json({
      status: 'Success',
      data: document,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const documents = await features.query.explain();
    const documents = await features.query;
    res.status(status('OK')).json({
      status: 'Success',
      result: documents.length,
      requestTime: req.requestTime,
      data: {
        documents,
      },
    });
  });
