const Order = require('../models/Order');

const getAnalytics = async (artistId) => {
    try {
        // Find orders containing artworks by this artist
        // This is complex because orders contain items. Ideally, we query OrderItems.
        // For simplicity, we fetch all orders and filter. Optimized approach would use Aggregation.

        // Aggregation to find total sales for an artist
        const stats = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "artworks",
                    localField: "orderItems.artworkId",
                    foreignField: "_id",
                    as: "artwork"
                }
            },
            { $unwind: "$artwork" },
            { $match: { "artwork.artistId": artistId, status: "Paid" } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$orderItems.price" }
                }
            }
        ]);

        return stats.length > 0 ? stats[0] : { totalSales: 0, totalRevenue: 0 };

    } catch (error) {
        throw error;
    }
};

module.exports = { getAnalytics };
