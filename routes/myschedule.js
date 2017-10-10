const express = require('express')
const boom = require('boom')
const router = express.Router()
const knex = require('../knex')

// C
router.post('/', (req, res, next) => {
  if (!req.body.time || !req.body.time.trim()) {
    res.status(500)
    res.render('error', { message: 'Time cannot be blank' })
  } else if (!req.body.item || !req.body.item.trim()) {
    res.status(500)
    res.render('error', { message: 'Item cannot be blank' })
  } else {
    knex('schedule')
      .insert({
        time: req.body.time,
        item: req.body.item,
        description: req.body.description,
        owner_id: 1
      }, '*')
      .then(() => {
        res.redirect('/myschedule')
      })
  }
})

// R info from db
router.get('/', (req, res, next) => {
  let id = 1 // id will eventually come from cookie

  let fName1
  let fName2
  let wedDate
  knex('owner')
    .select('first_name_1', 'first_name_2', 'wedding_date', 'template.template_name', 'schedule.*')
    .where('owner.id', id)
    .orderBy('time')
    .innerJoin('schedule', 'owner_id', 'owner.id')
    .innerJoin('template', 'template.id', 'owner.template_id')
    .then((data) => {
      fName1 = data[0].first_name_1
      fName2 = data[0].first_name_2
      wedDate = data[0].wedding_date.toString().slice(0, 15)

      for (let i = 0; i < data.length; i++) {
        delete data[i].created_at
        delete data[i].updated_at
      }

      res.render(
        'myschedule',
        {
          title: `Welcome to ${fName1} and ${fName2}'s wedding!`,
          data,
          wedDate,
          _layoutFile: 'layout.ejs'
        }
      )
    })
    .catch((err) => {
      next(err)
    })
})

// R to go to edit page
router.get('/:id', (req, res) => {
  const id = req.params.id
  if (typeof id !== 'undefined') {
    knex('owner')
    .select()
    .then((data) => {
      res.render('edit', { title: 'something is working' })
    })
  } else {
    res.status(500)
    res.render('error', { message: 'something went wrong' })
  }
})








  // res.render('edit') // , { title: 'Edit Event', _layoutFile: 'layout.ejs' })
// })

// U
router.patch('/:id', (req, res, next) => {
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return next()
  }

  knex('schedule')
    .where('id', id)
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not Found')
      }

      const { time, item, description } = req.body
      const updateRow = {}

      if (time) {
        updateRow.time = time
      }

      if (item) {
        updateRow.item = item
      }

      if (description) {
        updateRow.description = description
      }

      return knex('schedule')
        .update(updateRow, '*')
        .where('id', id)
    })
    .then((rows) => {
      res.send(rows[0])
    })
    .catch((err) => {
      next(err)
    })
})

// D
router.delete('/:id', (req, res, next) => {
  const id = Number(req.params.id)

  if (Number.isNaN(id)) {
    return next()
  }

  let event

  knex('schedule')
    .where('id', id)
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not Found')
      }
      event = row

      return knex('schedule')
        .del()
        .where('id', id)
    })
    .then(() => {
      delete event.id
      res.send(event)
    })
    .catch((err) => {
      next(err)
    })
})

module.exports = router
