//Routes for JObs

const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { isAdmin, isAuth } = require('../middleware/auth');
const Job = require('../models/Job');
const { validate } = require('jsonschema');
const { newJobSchema, updateJobSchema } = require('../schemas/job/job');

const router = express.Router({ mergeParams: true });

// Get all jobs

router.get('/', isAuth, async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.query);

    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
});

// Get Job by id

router.get('/:id', isAuth, async function (req, res, next) {
  try {
    const job = await Job.getById(req.params.id);
    return res.json({ job });
  } catch (e) {
    return next(e);
  }
});

router.post('/', isAdmin, async function (req, res, next) {
  try {
    const validation = validate(req.body, newJobSchema);

    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      );
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (e) {
    return next(e);
  }
});

// Edit job

router.patch('/:id', isAdmin, async function (req, res, next) {
  try {
    if ('id' in req.body) {
      throw new ExpressError('You are not allowed to change the ID', 400);
    }

    const validation = validate(req.body, updateJobSchema);
    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      );
    }
    var job = await Job.getById(req.params.id);

    if (!job) {
      throw new ExpressError(`There exists no company '${req.params.id}`, 404);
    }
    await job.save(job.id, req.body);
    var job = await Job.getById(req.params.id);

    return res.json({ job });
  } catch (e) {
    return next(e);
  }
});

// Removing a job

router.delete('/:id', isAdmin, async function (req, res, next) {
  try {
    let job = await Job.getById(req.params.id);
    await job.remove();
    return res.json({ message: 'Job deleted' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
