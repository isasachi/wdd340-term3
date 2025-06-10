const utilities = require(".")
const inventoryModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.addClassificationRules = () => {
    return [
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .matches("^[a-zA-Z0-9]+$")
        .withMessage("Please provide a valid name."), // on error this message is sent.
    ]
  }

validate.checkClassificationData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
    })
    return
  }
  next()
}

validate.addInventoryRules = () => {
  return [
      body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a valid make."),
        
        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a valid model."),

        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ max: 4 })
        .withMessage("Please provide a valid year."),

        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 15 })
        .withMessage("Description must be at least 15 characters long."),

        body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Please provide a valid image path."),

        body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Please provide a valid thumbnail path."),

        body("inv_price")
        .trim()
        .notEmpty()
        .isNumeric()
        .withMessage("Price must be a valid number."),

        body("inv_miles")
        .trim()
        .notEmpty()
        .isNumeric()
        .withMessage("Miles must be a valid number."),

        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a valid color."),

        body("classification_id")
        .trim()
        .notEmpty()
        .withMessage("Please select a classification"),
    ]
}

validate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    })
    return
  }
  next()
}

validate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body,inv_model}`,
      nav,
      classificationSelect,
      errors,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
      inv_id: req.body.inv_id
    })
    return
  }
  next()
}

validate.addPostFeedbackRules = () => {
  return [
    body("liked")
      .isBoolean(),

    body("comment")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please write a comment before submitting.")
  ]
}

validate.checkMarketplaceData = async (req, res, next) => {
   let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/marketplace", {
    title: "Marketplace",
    errors: null,
    nav,
    classificationSelect
  })
    return
  }
  next()
}

module.exports = validate
