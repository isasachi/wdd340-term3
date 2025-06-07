const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Default account route
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdateView))
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount))
// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
)
router.post(
  "/update", 
  regValidate.updateAccountRules(),
  regValidate.checkAccountUpdate,
  utilities.handleErrors(accountController.updateAccount))
router.post(
  "/change-password",
  regValidate.changePasswordRules(),
  regValidate.checkAccountUpdate,
  utilities.handleErrors(accountController.changePassword))
router.get("/logout", accountController.logout)

module.exports = router;