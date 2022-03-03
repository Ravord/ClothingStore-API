const mongoose = require('mongoose')

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Mongo is now running`)
  })
  .catch((err) => {
    console.log(err)
  })
