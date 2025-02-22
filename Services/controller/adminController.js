import User from '../models/User.js';
import BrokerClient from '../models/BrokerClient.js';
import mongoose from 'mongoose';

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .lean();

    // Get client counts for each user who has a broker
    const userStats = await Promise.all(
      users.map(async (user) => {
        const brokerClient = await BrokerClient.findOne({ client: user._id })
          .populate('broker', 'name email');
        
        return {
          ...user,
          broker: brokerClient?.broker || null,
          status: brokerClient?.status || 'unassigned'
        };
      })
    );

    res.json(userStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (status) {
      const brokerClient = await BrokerClient.findOne({ client: user._id });
      if (brokerClient) {
        brokerClient.status = status;
        await brokerClient.save();
      }
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete broker-client relationship if exists
    await BrokerClient.deleteOne({ client: user._id });
    await user.deleteOne();

    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Broker Management
export const getAllBrokers = async (req, res) => {
  try {
    const brokers = await User.find({ role: 'broker' })
      .select('-password')
      .lean();

    // Get client counts and performance stats for each broker
    const brokerStats = await Promise.all(
      brokers.map(async (broker) => {
        const clients = await BrokerClient.find({ broker: broker._id });
        const activeClients = clients.filter(c => c.status === 'active').length;
        
        // Calculate success rate (you can modify this based on your requirements)
        const successRate = ((activeClients / (clients.length || 1)) * 100).toFixed(1);

        return {
          ...broker,
          clients: clients.length,
          activeClients,
          successRate: `${successRate}%`,
          performance: '+24.5%' // This should be calculated based on actual trading data
        };
      })
    );

    res.json(brokerStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBroker = async (req, res) => {
  try {
    const { name, email, password, phone, license } = req.body;

    const brokerExists = await User.findOne({ email });
    if (brokerExists) {
      return res.status(400).json({ message: "Broker already exists" });
    }

    const broker = await User.create({
      name,
      email,
      password,
      phone,
      role: 'broker',
      license
    });

    res.status(201).json({
      _id: broker._id,
      name: broker.name,
      email: broker.email,
      phone: broker.phone,
      role: broker.role,
      license: broker.license
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBroker = async (req, res) => {
  try {
    const { name, email, phone, license, status } = req.body;
    const broker = await User.findById(req.params.id);

    if (!broker) {
      return res.status(404).json({ message: "Broker not found" });
    }

    broker.name = name || broker.name;
    broker.email = email || broker.email;
    broker.phone = phone || broker.phone;
    broker.license = license || broker.license;

    const updatedBroker = await broker.save();
    res.json({
      _id: updatedBroker._id,
      name: updatedBroker.name,
      email: updatedBroker.email,
      phone: updatedBroker.phone,
      role: updatedBroker.role,
      license: updatedBroker.license
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBroker = async (req, res) => {
  try {
    const broker = await User.findById(req.params.id);
    if (!broker) {
      return res.status(404).json({ message: "Broker not found" });
    }

    // Delete all broker-client relationships
    await BrokerClient.deleteMany({ broker: broker._id });
    await broker.deleteOne();

    res.json({ message: "Broker removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Broker-Client Management
export const assignClientToBroker = async (req, res) => {
  try {
    const { brokerId, clientId } = req.body;

    // Verify broker and client exist
    const [broker, client] = await Promise.all([
      User.findById(brokerId),
      User.findById(clientId)
    ]);

    if (!broker || broker.role !== 'broker') {
      return res.status(404).json({ message: "Broker not found" });
    }
    if (!client || client.role !== 'user') {
      return res.status(404).json({ message: "Client not found" });
    }

    // Create or update broker-client relationship
    const brokerClient = await BrokerClient.findOneAndUpdate(
      { broker: brokerId, client: clientId },
      { status: 'active' },
      { upsert: true, new: true }
    );

    res.json(brokerClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBrokerClients = async (req, res) => {
  try {
    const { brokerId } = req.params;
    const clients = await BrokerClient.find({ broker: brokerId })
      .populate('client', '-password')
      .lean();

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 