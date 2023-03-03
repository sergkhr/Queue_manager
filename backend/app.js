// const express = require("express");
// const BodyParser = require("body-parser");
// const bodyParser = require("body-parser");
import bodyParser from "body-parser";
import Express from "express";

export default class Application {
    constructor() {
        this.expressApp = Express();
        this.setupHandlers();
    }
    setupHandlers() {
        let app = this.expressApp;
        let jsonParser = bodyParser.json();
        app.get('/rooms', this.getTest.bind(this));
        app.post('/rooms', jsonParser, this.postTest.bind(this));
    }
    getTest(req, res) {
        let searchString = req.query.searchString || '';
        console.log(`GET: ${toString(req.query)}`);
        res.json({text: searchString});
    }
    postTest(req, res) {
        console.log(`POST: ${toString(req.body)}`);
        res.json({text: req.body});
    }
}