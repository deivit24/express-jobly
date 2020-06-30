// Company Routes

const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { isAuth, isAdmin } = require('../middleware/auth');
const Company = require('../models/Company');
const { validate } = require('jsonschema');

const {
  newCompanySchema,
  updateCompanySchema,
} = require('../schemas/company/company');

const router = new express.Router();

router.get('/', isAuth, async function (req, res, next) {
  try {
    let companies = await Company.getAll(req.query);
    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
});

// GET company by handle

router.get('/:handle', isAuth, async function (req, res, next) {
  try {
    const company = await Company.getByHandle(req.params.handle);
    console.log(company.handle);

    return res.json({ company });
  } catch (e) {
    return next(e);
  }
});

// POST route create a new company

router.post('/', isAdmin, async function (req, res, next) {
  try {
    const validation = validate(req.body, newCompanySchema);

    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      );
    }
    const { handle, name, description, logo_url, num_employees } = req.body;

    const company = await Company.create(
      handle,
      name,
      description,
      logo_url,
      num_employees
    );
    return res.status(201).json({ company });
  } catch (e) {
    return next(e);
  }
});

// PATCH ROUTE Updating a company

router.patch('/:handle', async function (req, res, next) {
  try {
    if ('handle' in req.body) {
      throw new ExpressError('You are not allowed to change the handle.', 400);
    }

    const validation = validate(req.body, updateCompanySchema);
    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      );
    }
    var company = await Company.getByHandle(req.params.handle);

    if (!company) {
      throw new ExpressError(
        `There exists no company '${req.params.handle}`,
        404
      );
    }
    await company.save(company.handle, req.body);

    var company = await Company.getByHandle(req.params.handle);
    //^^ When I would return 'company' it would update but it would returnm the original before the update. So I had to get the handle again so it could return the updated version

    return res.json({ company });
  } catch (e) {
    return next(e);
  }
});

// Removing a company if Admin

router.delete('/:handle', isAdmin, async function (req, res, next) {
  try {
    let company = await Company.getByHandle(req.params.handle);
    await company.remove();
    return res.json({ message: 'Company deleted' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
