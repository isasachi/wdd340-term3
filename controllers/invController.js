const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    grid,
  })
}

invCont.buildDetailById = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getDetailbyInvId(inv_id)
  const content = await utilities.buildDetailView(data)
  let nav = await utilities.getNav()
  const title = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  res.render("./inventory/detail", {
    title,
    nav,
    content
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Management",
    nav,
    errors: null,
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const insertResult = await invModel.addClassification(classification_name)
  if (insertResult.rowCount) {
    req.flash(
      "notice",
      `Congratulations, ${classification_name} has been added.`
    )
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, something went wrong. Try again please.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList(null) // Pass null for initial load
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
    inv_make: null,
    inv_model: null,
    inv_year: null,
    inv_description: null,
    inv_image: null,
    inv_thumbnail: null,
    inv_price: null,
    inv_miles: null,
    inv_color: null,
    classification_id: null, // Also pass null for classification_id
  })
}

invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const insertResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )
  if (insertResult.rowCount) {
    req.flash(
      "notice",
      `Congratulations, ${inv_make} ${inv_model} has been added.`
    )
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, something went wrong. Try again please.")
    let classificationList = await utilities.buildClassificationList(classification_id) // Pass classification_id for database error
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null, // Errors are handled by validation middleware, this is for DB errors
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

module.exports = invCont
