const express = require('express')
const router = express.Router()
const knex = require('../knex')

// READ for User
router.get('/', (req, res) => {
  // when authenticated, user can see owner, joined to schedule rendered on page
  knex('owner')
    .select('first_name_1', 'first_name_2', 'template.template_name', 'schedule.*')
    // .where('schedule.owner_id', 'owner.id')
    .innerJoin('schedule', 'owner_id', 'owner.id')
    .innerJoin('template', 'template.id', 'owner.template_id')
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        delete data[i].created_at
        delete data[i].updated_at
      }
      res.send(data)
    })
})


module.exports = router
