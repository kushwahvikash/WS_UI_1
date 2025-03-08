import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js"
import mongoose from 'mongoose';


//fuction for add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
    const image1 = req.files.image1 && req.files.image1[0]
    const image2 = req.files.image2 && req.files.image2[0]
    const image3 = req.files.image3 && req.files.image3[0]
    const image4 = req.files.image4 && req.files.image4[0]

    const images = [image1, image2, image3, image4].filter(item => item !== undefined)


    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url
      }))

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now()
    }

    const product = new productModel(productData);
    await product.save()
    res.json({ success: true, message: "Product added..!" })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}

//fuction for list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).populate("category subCategory").sort("-date");
    res.json({ success: true, products })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}


//fuction for remove product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    // TODO: Validate the product ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid product ID format" });
    }

    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//fuction for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid product ID format" })
    }
    const product = await productModel.findById(productId).populate("category subCategory");
    if (!product) return res.json({ success: false, message: "Product not found" })

    res.json({ success: true, product })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}

export { addProduct, listProducts, removeProduct, singleProduct }