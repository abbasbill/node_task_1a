'use strict'


const { INTEGER } = require('sequelize');
/*Powered By: Manaknightdigital Inc. https://manaknightdigital.com/ Year: 2021*/
/**
 * Quizzes Add View Model
 *
 * @copyright 2021 Manaknightdigital Inc.
 * @link https://manaknightdigital.com
 * @license Proprietary Software licensing
 * @author Ryan Wong
 */

 const db = require('../models')
 let AuthService = require('../services/AuthService');


module.exports = function (entity, pageName='', success, error, base_url = "" ) {

  this._entity = entity;
  this.session = null;

  this.success = success || null;
  this.error = error || null;

  this._base_url = base_url;
  
  

  this.get_page_name = () => pageName;

  this.endpoint = "/admin/terminate"


  this.heading =  "Add termination messages"

  this.action = "/admin/termination-add"

  

  this.form_fields = {"message":"","counter": INTEGER }  

  

  return this;
}
