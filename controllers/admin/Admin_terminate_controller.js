"use strict";

const app = require("express").Router();
// const Sequelize = require("sequelize");
// const logger = require("../../services/LoggingService");
// let pagination = require("../../services/PaginationService");
// let JwtService = require("../../services/JwtService");
let SessionService = require("../../services/SessionService");
const ValidationService = require("../../services/ValidationService");
// const PermissionService = require("../../services/PermissionService");
// const UploadService = require("../../services/UploadService");
// const AuthService = require("../../services/AuthService");
const db = require("../../models");
const helpers = require("../../core/helpers");

const role = 1;

app.get(
  "/admin/terminate/:num",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    try {

      // if (format != 'view') {
      //   res.json(viewModel.to_json());
      // } else {
      // }


      return res.render("admin/Terminate", viewModel);
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Terminate", viewModel);
    }
  }
);

app.post(
  "/admin/terminate-add",
  SessionService.verifySessionMiddleware(role, "admin"),
  ValidationService.validateInput(
    { message: "required", count: "required" },
    {
      "message.required": "Message is required",
      "count": "Count is required",
    }
  ),
  async function (req, res, next) {
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }
   
    try {
    const { message, counter } = req.body;
      const data = await db.terminate.insert({
        message,
        counter
      });

      if (!data) {
        // return res.render("admin/Add_terminate", viewModel);
        return res.json(data);
      }

      req.flash("success", "created successfully");
      return res.redirect("/admin/terminate/0");
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      // return res.render("admin/Add_Terminate", viewModel);
      return res.json(data);

    }
  }
);

app.get(
  "/admin/terminate-edit/:id",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    let id = req.params.id;
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }
    
    try {
      const exists = await db.terminate.getByPK(id);

      if (!exists) {
        req.flash("error", "not found");
        return res.redirect("/admin/terminate/0");
      }
      // return res.render("admin/Edit_Terminate", viewModel);
      return res.send("exists");

    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      // return res.render("admin/Edit_Terminate", viewModel);
    }
  }
);

app.post(
  "/admin/terminate-edit/:id",
  SessionService.verifySessionMiddleware(role, "admin"),
  ValidationService.validateInput(
    { message: "required" },
    { "message.required": "Message is required" }
  ),
  async function (req, res, next) {
    let id = req.params.id;
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }

    try {
      if (req.validationError) {
        viewModel.error = req.validationError;
        // return res.render("admin/Edit_Terminate", viewModel);
      return res.send("error");

      }

      const resourceExists = await db.terminate.getByPK(id);
      if (!resourceExists) {
        req.flash("error", "not found");
        return res.redirect("/admin/terminate/0");
      }

      let data = await db.terminate.edit(
        {
          message,
          counter
        },
        id
      );
      // if (!data) {
      //   viewModel.error = "Something went wrong";
      //   return res.render("admin/Edit_Terminate", viewModel);
      // }

      req.flash("success", "edited successfully");

      return res.redirect("/admin/terminate/0");
    } catch (error) {
      console.error(error);
      // return res.render("admin/Edit_Terminate", viewModel);
      return res.send("error")
    }
  }
);

app.get(
  "/admin/terminate-delete/:id",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    let id = req.params.id;

    try {
      const exists = await db.terminate.getByPK(id);

      if (!exists) {
        req.flash("error", "not found");
        return res.redirect("/admin/terminate/0");
      }

      await db.terminate.realDelete(id);

      req.flash("success", "deleted successfully");

      return res.redirect("/admin/terminate/0");
    } catch (error) {
      console.error(error);
      req.flash("error", error.message || "Something went wrong");
      return res.redirect("/admin/terminate/0");
    }
  }
);

// APIS
app.get("/api/v1/terminate", async function (req, res, next) {
  try {
    const terminate = await db.terminate.findAll();

    const response = { terminate: terminate };

    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Something went wrong",
      });
  }
});
module.exports = app;
