'use strict'

const AccessService = require("../services/access.service")

const { OK, CREATED } = require('../core/success.response')

class AccessController {

  signUp = async (req, res, next) => {

    // return res.status(201).json()
    new CREATED({
      message: 'Registered OK!',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res)

  }
}

module.exports = new AccessController()