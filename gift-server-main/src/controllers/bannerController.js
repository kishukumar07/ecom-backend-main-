import Banner from '../models/bannerModel.js';
import uploadOnCloudinary from '../utils/media/uploadImage.js';

// Create a new banner
export const createBanner = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ 
        success: false,
        message: 'Please upload an image' 
      });
    }

    const result = await uploadOnCloudinary(req.file.path);
    if (!result) {
      return res.status(400).json({ 
        success: false,
        message: 'Image upload failed' 
      });
    }

    const banner = new Banner({
      image: result.secure_url
    });

    const savedBanner = await banner.save();
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: savedBanner
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get a single banner
export const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ 
        success: false,
        message: 'Banner not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update a banner
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ 
        success: false,
        message: 'Banner not found' 
      });
    }

    if (req.file?.path) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result) {
        return res.status(400).json({ 
          success: false,
          message: 'Image upload failed' 
        });
      }
      banner.image = result.secure_url;
    }

    const updatedBanner = await banner.save();
    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedBanner
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete a banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ 
        success: false,
        message: 'Banner not found' 
      });
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}; 