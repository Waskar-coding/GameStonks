//Packages
const express = require('express');
const passport = require('passport');
const router = express.Router();

//Local schemas
const Doc = require('../schemas/schema-doc');

//Local modules
const defaultSearch = require('../useful-functions/search');
const {docSearchFiltering, docSearchSuccess} = require('../scripts-doc/doc-search');
const mountDocument = require('../scripts-doc/doc-mount');

//Find articles
router.get('/find', (req, res) => {
    defaultSearch(req, res, Doc, {doc_type: 'article'}, 2, docSearchFiltering, docSearchSuccess)
});

//Mount documentation
router.get('/:docId/mount', (req, res) => {mountDocument(req, res)});

//Main function
module.exports = router;