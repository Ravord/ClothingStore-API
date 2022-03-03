const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  imageURL: {
    type: String
  },
  name: {
    required: true,
    type: String
  },
  price: {
    required: true,
    type: Number
  }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
