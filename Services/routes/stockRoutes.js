import express from "express";
import {
  getQuote,
  getMultipleQuotes,
  getHistoricalData,
  getChartData,
  searchStocks,
} from "../controller/stockController.js";

const router = express.Router();

router.get("/quote/:symbol", getQuote);

router.get("/quotes", getMultipleQuotes);

router.get("/historical/:symbol", getHistoricalData);

router.get("/chart/:symbol", getChartData);

router.get("/search", searchStocks);

export default router;
