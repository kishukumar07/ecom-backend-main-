import Address from '../models/addressModel.js';
import User from '../models/userModel.js';

const createAddress = async (req, res) => {
  try {
    const { fullName, addressLine1, addressLine2, city, state, country, isDefault, phone, zipCode } = req.body;
    // console.log(street, zipCode, city, state, country);
    if (!addressLine1 || !zipCode || !city || !state || !country || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const address = await Address.create({ fullName, addressLine1, addressLine2, city, state, country, isDefault, phone, zipCode });
    await User.findByIdAndUpdate(req.userId, { $push: { addresses: address._id } });
    res.status(201).json({ message: 'Address created successfully', data: address });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find();
    res.status(200).json({ message: 'All addresses fetched successfully', data: addresses });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json({ message: 'Address fetched successfully', data: address });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getAddress = async (req, res) => {
  const userId = req.userId;
    console.log("XXXXXXXXXXXSSSSSSSSSS",userId)
  try {
    
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = await User.findById(userId).select("addresses").populate("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ addresses: user.addresses || [] });
  } catch (error) {
    console.error("Error in getAddress:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { street, zipCode, city, state, country } = req.body;
    const { id } = req.params;
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    address.street = street || address.street;
    address.zipCode = zipCode || address.zipCode;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    const updatedAddress = await address.save();
    res.status(200).json({ message: 'Address updated successfully', data: updatedAddress });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAddress = await Address.findByIdAndDelete(id);
    if (!deletedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
    await User.findByIdAndUpdate(req.userId, { $pull: { addresses: id } });
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  getAddress
};
