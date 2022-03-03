require('dotenv').config()
require('./db.js')

const express = require('express')
const app = express()
app.use(express.json())
const Product = require('./models/productSchema.js')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000

const cors = require('cors')
app.use(cors({
  origin: process.env.CORS_ORIGIN
}))

app.get('/', (req, res, next) => {
  return res.status(200).json({ msg: 'Clothing Store API is working correctly' })
})
app.get('/products', async (req, res, next) => {
  try {
    let products = await Product.find()
    return res.status(200).json(products)
  }
  catch (err) { next(err) }
})
// code below was only used to add first entries to the database
/*
app.post('/products', async (req, res, next) => {
  try {
    let newProduct = await Product.create({ imageURL: req.body.imageURL, name: req.body.name, price: req.body.price })
    return res.status(201).json(newProduct)
  }
  catch (err) { next(err) }
})
*/
app.post('/stripe', async (req, res, next) => {
  try {
    let promises = req.body.products.map(async (clientProduct) => {
      let serverProduct = await Product.findById(clientProduct._id)
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            images: [serverProduct.imageURL],
            name: serverProduct.name
          },
          unit_amount: serverProduct.price * 100
        },
        quantity: 1
      }
    })
    let lineItems = await Promise.all(promises)
    let session = await stripe.checkout.sessions.create({
      cancel_url: process.env.CORS_ORIGIN + '/cart',
      line_items: lineItems,
      mode: 'payment',
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US']
      },
      success_url: process.env.CORS_ORIGIN + '/?isCartCleared=true'
    })
    return res.status(201).json({ url: session.url })
  }
  catch (err) { next(err) }
})

app.use((err, req, res, next) => {
  switch (err.name) {
    case 'ValidationError':
      return res.status(400).json({ msg: err.message })
    default:
      return res.status(500).json({ msg: err.message })
  }
})

app.listen(port, () => {
  console.log(`App is now running on port ${port}`)
})
