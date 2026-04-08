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
}: {
    symbol: string;
    company: string;
    quantity: number;
    purchasePrice: number;
    purchaseType: 'market' | 'limit';
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Not authenticated');

    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    if (purchasePrice <= 0) throw new Error('Price must be greater than 0');

    await connectToDatabase();

    const existing = await Portfolio.findOne({ userId: session.user.id, symbol: symbol.toUpperCase() });
    if (existing) {
        const totalQty = existing.quantity + quantity;
        const avgPrice = (existing.purchasePrice * existing.quantity + purchasePrice * quantity) / totalQty;
        existing.quantity = totalQty;
        existing.purchasePrice = Math.round(avgPrice * 100) / 100;
        existing.purchaseType = purchaseType;
        await existing.save();
    } else {
        await Portfolio.create({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
            company,
            quantity,
            purchasePrice,
            purchaseType,
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
        purchasedAt: item.purchasedAt?.toISOString(),
    }));
}

export async function sellStock({ symbol, quantity }: { symbol: string; quantity: number }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('Not authenticated');

    if (quantity <= 0) throw new Error('Quantity must be greater than 0');

    await connectToDatabase();

    const holding = await Portfolio.findOne({ userId: session.user.id, symbol: symbol.toUpperCase() });
    if (!holding) throw new Error('Stock not found in your portfolio');
    if (quantity > holding.quantity) throw new Error(`You only have ${holding.quantity} shares to sell`);

    if (quantity === holding.quantity) {
        await Portfolio.deleteOne({ userId: session.user.id, symbol: symbol.toUpperCase() });
    } else {
        holding.quantity -= quantity;
        await holding.save();
    }

    revalidatePath('/portfolio');
    return { success: true };
}
