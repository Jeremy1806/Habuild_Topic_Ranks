const { Topic, Ranking } = require("../models/index");

module.exports.createRanks = async (req, res, next) => {
  try {
    for (let i = 1; i <= 100; i++) {
      const newRank = await Ranking.create({
        ranking: i,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports.getTopics = async (req, res, next) => {
  try {
    const data = await Topic.findAll({});

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports.createTopic = async (req, res, next) => {
  try {
    if (+req.body.rank > 100)
      return res.status(401).json({
        status: "failed",
      });

    const newTopic = await Topic.create({
      topic: req.body.topic,
      rankingId: req.body.rank,
    });

    res.status(200).json({
      status: "success",
      newTopic,
    });
  } catch (error) {
    console.error(error);
  }
};
