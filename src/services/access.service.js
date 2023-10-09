'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("node:crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {

  static signUp = async ({ name, email, password }) => {
    try {
      // step1: check email exists??

      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        return {
          code: 'xxxx',
          message: 'Shop already registered!'
        }
      }

      const passwordHash = await bcrypt.hash(password, 10) // tham so thu 2 la salt-su kho khan, lien quan den CPU nen cang nhieu thi cang ton memory
      const newShop = await shopModel.create({
        name, email, password: passwordHash, roles: [RoleShop.SHOP]
      })

      if (newShop) {

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');
        //Public key CryptoGraphy Standards !

        console.log({ privateKey, publicKey }) //save collection keystore

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        })

        if (!keyStore) {
          return {
            code: 'xxxx',
            message: 'keyStore error'
          }
        }

        
        // created token pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
        console.log(`Created Token Success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
            tokens
          }
        }
        // const tokens = await 
      }

      return {
        code: 200,
        metadata: null
      }
    } catch (error) {
      console.log(error);
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService