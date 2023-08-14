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
      let session = req.session;
      let paginateListViewModel = require("../../view_models/terminate_admin_list_paginate_view_model");

      var viewModel = new paginateListViewModel(
        db.terminate,
        "Terminate",
        session.success,
        session.error,
        "/admin/terminate"
      );

      viewModel._column = ["ID", "Message", "Counter", "Action"];
      viewModel._readable_column = ["ID", "Message", "Counter"];

      // const format = req.query.format ? req.query.format : "view";
      // const direction = req.query.direction ? req.query.direction : "ASC";
      // const per_page = req.query.per_page ? req.query.per_page : 10;
      // let order_by = req.query.order_by
      //   ? req.query.order_by
      //   : viewModel.get_field_column()[0];
      // let orderAssociations = [];
      // viewModel.set_order_by(order_by);
      // let joins = order_by.includes(".") ? order_by.split(".") : [];
      // order_by = order_by.includes(".") ? joins[joins.length - 1] : order_by;
      // if (joins.length > 0) {
      //   for (let i = joins.length - 1; i > 0; i--) {
      //     orderAssociations.push(`${joins[i - 1]}`);
      //   }
      // }
      // Check for flash messages
      const flashMessageSuccess = req.flash("success");
      if (flashMessageSuccess && flashMessageSuccess.length > 0) {
        viewModel.success = flashMessageSuccess[0];
      }
      const flashMessageError = req.flash("error");
      if (flashMessageError && flashMessageError.length > 0) {
        viewModel.error = flashMessageError[0];
      }

      viewModel.set_id(req.query.id ? req.query.id : "");
      viewModel.set_message(req.query.message ? req.query.message : "");

      let where = helpers.filterEmptyFields({
        id: viewModel.get_id(),
        message: viewModel.get_message(),
      });

      
    // let associatedWhere = helpers.filterEmptyFields({});
    // const isAssociationRequired =
    //   Object.keys(associatedWhere).length > 0 ? true : false;

    // const count = await db.terminate._count(where, [
    //   {
    //     model: db.answer,
    //     where: associatedWhere,
    //     required: isAssociationRequired,
    //     as: "answer",
    //   },
    // ]);



        // viewModel.set_total_rows(count);
        // viewModel.set_per_page(+per_page);
        // viewModel.set_page(+req.params.num);
        // viewModel.set_query(req.query);
        // viewModel.set_sort_base_url(`/admin/terminate/${+req.params.num}`);
        // viewModel.set_sort(direction);

        const list = await db.terminate.findAll(
          // db,
          // // associatedWhere,
          // viewModel.get_page() - 1 < 0 ? 0 : viewModel.get_page(),
          // viewModel.get_per_page(),
          // where,
          // order_by,
          // direction,
          // orderAssociations
        );

        viewModel.set_list(list);

        if (format == "csv") {
          const csv = viewModel.to_csv();
          return res
            .set({
              "Content-Type": "text/csv",
              "Content-Disposition": 'attachment; filename="export.csv"',
            })
            .send(csv);
        }
      // if (format != 'view') {
      //   res.json(viewModel.to_json());
      // } else {
      // }

      return res.render("admin/Terminate");
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Terminate", viewModel);
    }
  }
);

app.get(
  "/admin/terminate-add",
  SessionService.verifySessionMiddleware(role, "admin"),
  async function (req, res, next) {
    if (req.session.csrf === undefined) {
      req.session.csrf = SessionService.randomString(100);
    }

    const terminateAdminAddViewModel = require("../../view_models/terminate_admin_add_view_model");

    const viewModel = new terminateAdminAddViewModel(
      db.terminate,
      "Add terminationMessage",
      "",
      "",
      "/admin/terminate"
    );
    res.render("admin/Add_Terminate", viewModel);
  }
);

app.post(
  "/admin/terminate-add",
  SessionService.verifySessionMiddleware(role, "admin"),
  ValidationService.validateInput(
    { message: "required", counter: "required" },
    {
      "message.required": "Message is required",
      "counter": "Count is required",
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
        return res.render("admin/Add_terminate", viewModel);
      }

      req.flash("success", "created successfully");
      return res.redirect("/admin/terminate/0");
    } catch (error) {
      console.error(error);
      viewModel.error = error.message || "Something went wrong";
      return res.render("admin/Add_Terminate", viewModel);
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
