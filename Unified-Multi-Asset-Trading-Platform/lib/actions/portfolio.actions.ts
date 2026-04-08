'use server';

import { connectToDatabase } from '@/database/mongoose';
import Portfolio from '@/database/models/portfolio.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function buyStock({
    symbol,
    company,
    quantity,
    purchasePrice,
    purchaseType,
    assetType = 'stock',
}: {
    symbol: string;
    company: string;
    quantity: number;
    purchasePrice: number;
    purchaseType: 'market' | 'limit';
    assetType?: 'stock' | 'crypto';
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Not authenticated');

    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    if (purchasePrice <= 0) throw new Error('Price must be greater than 0');

    await connectToDatabase();

    const lookupSymbol = assetType === 'crypto' ? symbol : symbol.toUpperCase();
    const existing = await Portfolio.findOne({ userId: session.user.id, symbol: lookupSymbol });
    if (existing) {
        const totalQty = existing.quantity + quantity;
        const avgPrice = (existing.purchasePrice * existing.quantity + purchasePrice * quantity) / totalQty;
        existing.quantity = totalQty;
        existing.purchasePrice = Math.round(avgPrice * 10000) / 10000;
        existing.purchaseType = purchaseType;
        await existing.save();
    } else {
        await Portfolio.create({
            userId: session.user.id,
            symbol: lookupSymbol,
            company,
            quantity,
            purchasePrice,
            purchaseType,
            assetType,
        });
    }

    revalidatePath('/portfolio');
    return { success: true };
}

export async function getPortfolio() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Not authenticated');

    await connectToDatabase();

    const items = await Portfolio.find({ userId: session.user.id }).sort({ purchasedAt: -1 }).lean();
    return items.map((item: any) => ({
        id: item._id.toString(),
        symbol: item.symbol,
        company: item.company,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        purchaseType: item.purchaseType,
        assetType: (item.assetType as 'stock' | 'crypto') ?? 'stock',
        purchasedAt: item.purchasedAt?.toISOString(),
    }));
}

export async function sellStock({ symbol, quantity }: { symbol: string; quantity: number }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Not authenticated');

    if (quantity <= 0) throw new Error('Quantity must be greater than 0');

    await connectToDatabase();

    const holding = await Portfolio.findOne({ userId: session.user.id, symbol });
    if (!holding) throw new Error('Asset not found in your portfolio');
    if (quantity > holding.quantity) throw new Error(`You only have ${holding.quantity} units to sell`);

    const remaining = Math.round((holding.quantity - quantity) * 1e8) / 1e8;
    if (remaining <= 0) {
        await Portfolio.deleteOne({ userId: session.user.id, symbol });
    } else {
        holding.quantity = remaining;
        await holding.save();
    }

    revalidatePath('/portfolio');
    return { success: true };
}
