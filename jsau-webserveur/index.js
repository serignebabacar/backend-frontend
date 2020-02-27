'use strict'
const express = require('express')
const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const PORT = process.env.PORT || 8080
const cool = require('cool-ascii-faces')
const {Pool} = require('pg')
let jsauNews = require('jsau-test')
// eslint-disable-next-line no-unused-vars
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

express()
    .use(cors())
    .use(bodyParser.json()) // Body parser use JSON data
    .use(bodyParser.urlencoded({extended: true}))
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/cool', (req, res) => res.send(cool()))
/*.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      return
    }
  })*/
    .get('/news', (req, res) => {
        let results = []
        fs.readFile('fichierTest.json', 'utf8', (err, data) => {
            results = JSON.parse(data)
            res.render('pages/donnees', {resultats:results})
            if (err) {
                console.error(err)
                return
            }
        })
    })
    .get('/affiche', (req, res) => {
        let results = []
        fs.readFile('fichierTest.json', 'utf8', (err, data) => {
            results = JSON.parse(data)
            res.render('pages/affiche', {resultats:results})
            if (err) {
                console.error(err)
                return
            }
        })
    })
    .get('/news/:id', (req, res) => {
        let results = []
        let userId = req.params.id

        fs.readFile('fichierTest.json', 'utf8', (err, data) => {
            results = JSON.parse(data)
            for (let i = 0;i < results.length;i++) {
                if (results[i].id == userId) {
                    results.splice(i, 1)
                    fs.writeFile('fichierTest.json', JSON.stringify(results, null, 2), 'utf8', () => {
                        //res.redirect('/news')
                        res.render('pages/affiche', {resultats:results})
                    })
                }
            }

            if (err) {
                console.error(err)
            }
        })
    })
    .get('/update/:id', (req, res) => {
        let results = []
        let userId = req.params.id

        fs.readFile('fichierTest.json', 'utf8', (err, data) => {
            // res.redirect('/news')
            results = JSON.parse(data)
            let k = 0
            for (let i = 0;i < results.length;i++) {
                if (results[i].id == userId) {
                    k = i
                }
            }
            res.render('pages/update', {objet:results[k]})
            if (err) {
                console.error(err)
            }
        })
    })
    .post('/news', (req, res) => {

        fs.readFile('fichierTest.json', 'utf8', (err, data) => {
            let results = JSON.parse(data)
            let tab_ids = []
            for (let i = 0;i < results.length;i++) {
                tab_ids[i] = results[i].id
            }
            req.body.id = Math.max(...tab_ids) + 1
            if (req.body.id == '-Infinity') {
                req.body.id = 1
            }
            req.body.date = new Date().toISOString().
                replace(/T/, ' ').
                replace(/\..+/, '')
            if (!req.body.nomNouvel && !req.body.contenu) {
                res.render('pages/donnees', {resultats:results})
            } else {
                if (jsauNews.validate(req.body.nomNouvel)) {
                    results.push(req.body)
                    fs.writeFile('fichierTest.json', JSON.stringify(results, null, 2), 'utf8', () => {
                        res.render('pages/affiche', {resultats:results})
                    })
                } else {
                    res.render('pages/donnees', {error:"le nom n'est pas accepte"})
                    return
                }
            }
        })
    })
    .post('/update/:id', (req, res) => {

        fs.readFile('fichierTest.json', 'utf8', (err, data) => {
            let results = JSON.parse(data)
            let userId = req.params.id
            let k = 0
            for (let i = 0;i < results.length;i++) {

                if (results[i].id == userId) {
                    results[i] = req.body
                    k = 1
                }
            }
            if (k == 1) {
                fs.writeFile('fichierTest.json', JSON.stringify(results, null, 2), 'utf8', () => {
                    res.render('pages/affiche', {resultats:results})
                })
            }

        })
    })
    .listen(PORT, () => console.log(`Listening on localhost:${ PORT }`))
