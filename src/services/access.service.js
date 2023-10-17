'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("node:crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")

/// service ///

const { findByEmail } = require("./shop.service")
const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService { 

  /*
    Check this token used?
  */
  static handlerRefreshToken = async ( refreshToken ) => {

    // check xem token nay` da duoc su dung chua?
    const foundToken = await KeyTokenService.findByRefreshTokenUsed( refreshToken )
    //neu co
    if(foundToken) {
      // decode xem may` la thang` nao`?
      const { userId, email } = await verifyJWT( refreshToken, foundToken.privateKey) 
      console.log('[1]--', { userId, email });
      //xoa tat ca token trong keyStore
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something wrong happend !! Please login again !')
    }

    // NO, qua ngon
    const holderToken = await KeyTokenService.findByRefreshToken( refreshToken )
    if(!holderToken) throw new AuthFailureError(' Shop not registered 1')

    // verifyToken
    const { userId, email } = await verifyJWT( refreshToken, holderToken.privateKey) 
    console.log('[2]--', { userId, email });

    // check UserId
    const foundShop = await findByEmail( {email} )
    if(!foundShop) throw new AuthFailureError(' Shop not registered 2')

    // create 1 cap moi
    const tokens = await createTokenPair({ userId: foundShop._id, email }, holderToken.publicKey, holderToken.privateKey)

    //update token 
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken //da duoc su dung de lay token moi roi
      }
    })

    return {
      user: { userId, email },
      tokens
    }
  }

  static logout = async( keyStore ) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    return delKey
  }

  /**
   * 1 - check email in dbs
   * 2 - match password
   * 3 - create AT vs RT and save
   * 4 - generate tokens
   * 5 - get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {

    //1.
    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new BadRequestError('Shop not registered')

    //2.
    const match = bcrypt.compare(password, foundShop.password)
    if (!match) throw new AuthFailureError('Authentication error')

    //3.
    // Created privateKey, puclicKey
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');
    //4 - generate tokens
    const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken, 
      privateKey, publicKey,
      userId: foundShop._id
    })

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
    // try {
      // step1: check email exists??
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        throw new BadRequestError('Error: Shop already registered!')
      }

      const passwordHash = await bcrypt.hash(password, 10) // tham so thu 2 la salt-su kho khan, lien quan den CPU nen cang nhieu thi cang ton memory
      const newShop = await shopModel.create({
        name, email, password: passwordHash, roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // Created privateKey, puclicKey
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
          // throw new BadRequestError('Error: Shop already registered!')
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
    // } catch (error) {
    //   console.log(error);
    //   return {
    //     code: 'xxx',
    //     message: error.message,
    //     status: 'error'
    //   }
    // }
  }
}

module.exports = AccessService