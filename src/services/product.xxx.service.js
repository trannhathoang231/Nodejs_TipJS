'use strict' // nghiem ngat: code cu phap nghiem ngat vd x= 10 => x is not defined vi` thieu var/let

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError, ForbiddenError } = require('../core/error.response')
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById
} = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')

// define Factory class to create product
class ProductFactory {
  static productRegistry = {} // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

    return new productClass(payload).createProduct()
  }
  // write in factory for strategy
  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

    return new productClass(payload).updateProduct(productId)
  }

  // PUT //
  static async publishProductByShop(product_shop, product_id) {
    return await publishProductByShop(product_shop, product_id)
  }

  static async unPublishProductByShop(product_shop, product_id) {
    return await unPublishProductByShop(product_shop, product_id)
  }
  // END PUT //


  // query ///

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async getListSearchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProducts ( {limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true}} ) {
    return await findAllProducts({ limit, sort, page, filter, 
      select: ['product_name', 'product_price', 'product_thumb'] 
    })
  }

  static async findProduct ( {product_id} ) {
    return await findProduct({ product_id, unSelect: ['__v'] })
  }


}

// define base product class
class Product {
  constructor({
    product_name, product_thumb, product_description, product_price,
    product_quantity, product_type, product_shop, product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id })
  }

  // update product
  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({productId, bodyUpdate, model: product})
  }
}

// Define sub-class for different product types Clothing
class Clothing extends Product {

  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('create new Clothing error')

    const newProduct = await super.createProduct(newClothing._id)
    if (!newProduct) throw new BadRequestError('create new Product error')

    return newProduct;
  }

  async updateProduct( productId ) {
    /*
      {
        a: undefined,
        b: null
      }
    */
   //1. remove attr has null undefined
  //  console.log(`[1]::`, this);
   const objectParams = removeUndefinedObject(this)
  //  console.log(`[2]::`, objectParams);
   //2. check xem update o cho nao?
   if(objectParams.product_attributes) {
    // update child
    await updateProductById({
      productId, 
      bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), 
      model: clothing
    })
   }

   const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
   return updateProduct
  }
}

// Define sub-class for different product types Electronics
class Electronics extends Product {

  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronic) throw new BadRequestError('create new Electronics error')

    const newProduct = await super.createProduct(newElectronic._id)
    if (!newProduct) throw new BadRequestError('create new Product error')

    return newProduct;
  }
}

// Define sub-class for different product types Furniture
class Furniture extends Product {

  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newFurniture) throw new BadRequestError('create new Furniture error')

    const newProduct = await super.createProduct(newFurniture._id)
    if (!newProduct) throw new BadRequestError('create new Product error')

    return newProduct;
  }
}

// register product types
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory