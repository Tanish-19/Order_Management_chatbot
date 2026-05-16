import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);

export default router;
