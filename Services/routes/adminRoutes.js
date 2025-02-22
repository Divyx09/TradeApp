import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllBrokers,
  createBroker,
  updateBroker,
  deleteBroker,
  assignClientToBroker,
  getBrokerClients
} from '../controller/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes and check for admin role
router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  next();
});

// User Management Routes
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Broker Management Routes
router.route('/brokers')
  .get(getAllBrokers)
  .post(createBroker);

router.route('/brokers/:id')
  .put(updateBroker)
  .delete(deleteBroker);

// Broker-Client Management Routes
router.post('/assign-client', assignClientToBroker);
router.get('/broker-clients/:brokerId', getBrokerClients);

export default router; 