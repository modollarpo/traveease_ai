import { Injectable } from '@nestjs/common';

@Injectable()
export class MultiVendorCartService {
  async createCart(params: {
    userId: string;
    items: Array<{
      vendorId: string;
      itemType: 'flight' | 'hotel' | 'car' | 'activity' | 'shuttle';
      price: number;
      currency: string;
    }>;
  }) {
    // Group items by vendor for split payments
    const vendorGroups = {};
    params.items.forEach((item) => {
      if (!vendorGroups[item.vendorId]) {
        vendorGroups[item.vendorId] = [];
      }
      vendorGroups[item.vendorId].push(item);
    });

    return {
      cartId: `cart_${Date.now()}`,
      userId: params.userId,
      vendorGroups,
      itemCount: params.items.length,
      totalPrice: params.items.reduce((sum, item) => sum + item.price, 0),
    };
  }

  async applyVendorMarkup(params: {
    basePrice: number;
    vendorId: string;
    itemType: string;
  }): Promise<{ basePrice: number; markup: number; totalPrice: number }> {
    // Markup logic per vendor type (flight, hotel, etc.)
    let markupPercent = 0;
    switch (params.itemType) {
      case 'flight':
        markupPercent = 8;
        break;
      case 'hotel':
        markupPercent = 12;
        break;
      case 'car':
        markupPercent = 15;
        break;
      case 'activity':
        markupPercent = 20;
        break;
      case 'shuttle':
        markupPercent = 10;
        break;
    }
    const markup = Math.floor((params.basePrice * markupPercent) / 100);
    return {
      basePrice: params.basePrice,
      markup,
      totalPrice: params.basePrice + markup,
    };
  }
}
