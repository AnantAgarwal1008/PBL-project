import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true },
    company: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseType: { type: String, enum: ['market', 'limit'], required: true },
    assetType: { type: String, enum: ['stock', 'crypto'], default: 'stock' },
    purchasedAt: { type: Date, default: Date.now },
});

const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
