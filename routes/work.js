const express = require("express");
const router = express.Router();
const work = require("../services/work");

router.get("/", async function (req, res, next) {
  // GET work.
  if (req.baseUrl === "/") {
    try {
      res.json(await work.getMultiple(req.query.page));
    } catch (err) {
      console.error(`Error while getting work `, err.message);
      next(err);
    }
  }

  // CREATE work.
  if (req.baseUrl === "/create-work") {
    try {
      res.json(await work.createWork());
    } catch (err) {
      console.error(`Error while creating work `, err.message);
      next(err);
    }
  }
});

module.exports = router;
