const express = require('express');
const router = express.Router();
const path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Événement Spécial - Vases d'Honneur" });
});

/* GET admin page. */
router.get('/admin', function(req, res, next) {
    res.render('admin', { title: "Administration - Vases d'Honneur" });
})

module.exports = router;
