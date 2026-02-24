const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Artwork = require('./models/Artwork');
const ArtistProfile = require('./models/ArtistProfile');
const Order = require('./models/Order');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await User.deleteMany({});
        await Artwork.deleteMany({});
        await ArtistProfile.deleteMany({});
        await Order.deleteMany({});

        console.log('Cleared DB.');

        const artistsData = [
            { name: 'Vincent Van Gogh', email: 'vincent@art.com', bio: 'Starry nights and sunflowres.' },
            { name: 'Pablo Picasso', email: 'pablo@art.com', bio: 'Cubism master.' },
            { name: 'Leonardo Da Vinci', email: 'leo@art.com', bio: 'Renaissance man.' },
            { name: 'Claude Monet', email: 'claude@art.com', bio: 'Impressionist landscapes.' },
            { name: 'Salvador Dali', email: 'salvador@art.com', bio: 'Surrealist dreams.' },
            { name: 'Frida Kahlo', email: 'frida@art.com', bio: 'Self-portraits and nature.' }
        ];

        const artists = [];
        for (const artist of artistsData) {
            const user = await User.create({
                name: artist.name,
                email: artist.email,
                password: 'password123',
                role: 'artist'
            });

            await ArtistProfile.create({
                userId: user._id,
                bio: artist.bio,
                portfolio: [],
                socialLinks: {}
            });
            artists.push(user);
        }

        const artworks = [
            {
                artistId: artists[0]._id, // Vincent
                title: 'Starry Night',
                description: 'A mesmerizing depiction of the night sky.',
                price: 1200,
                medium: 'Oil',
                style: 'Impressionism',
                images: './uploads/art1.jpg',
                rating: 4.9,
                salesCount: 150
            },
            {
                artistId: artists[1]._id, // Pablo
                title: 'Abstract Harmony',
                description: 'A vibrant exploration of color and form.',
                price: 850,
                medium: 'Acrylic',
                style: 'Abstract',
                images: './uploads/art2.jpg',
                rating: 4.5,
                salesCount: 89
            },
            {
                artistId: artists[2]._id, // Leo
                title: 'Modern City Life',
                description: 'A digital masterpiece of urban life.',
                price: 950,
                medium: 'Digital',
                style: 'Realism',
                images: './uploads/art3.jpg',
                rating: 4.2,
                salesCount: 45
            },
            {
                artistId: artists[3]._id, // Claude
                title: 'Sunset Boulevard',
                description: 'Warm glow of the setting sun.',
                price: 600,
                medium: 'Watercolor',
                style: 'Realism',
                images: './uploads/art6.jpg',
                rating: 4.8,
                salesCount: 200
            },
            {
                artistId: artists[4]._id, // Salvador
                title: 'Forest Whisper',
                description: 'Detailed charcoal sketch of a forest.',
                price: 450,
                medium: 'Charcoal',
                style: 'Sketch',
                images: './uploads/images-1766852937754.jpg',
                rating: 4.0,
                salesCount: 12
            },
            {
                artistId: artists[5]._id, // Frida
                title: 'Geometric Dreams',
                description: 'Sharp lines and bold colors.',
                price: 1100,
                medium: 'Mixed Media',
                style: 'Geometric',
                images: './uploads/images-1767025475207.jpg',
                rating: 4.7,
                salesCount: 67
            },
            // Newly Added
            {
                artistId: artists[0]._id,
                title: 'Sunflower Fields',
                description: 'Bright yellow sunflowers under a blue sky.',
                price: 1300,
                medium: 'Oil',
                style: 'Impressionism',
                images: './uploads/images-1767033822294.jpg',
                rating: 4.8,
                salesCount: 22
            },
            {
                artistId: artists[1]._id,
                title: 'Cubist Guitar',
                description: 'Deconstructed guitar form.',
                price: 900,
                medium: 'Acrylic',
                style: 'Abstract',
                images: './uploads/images-1767025475205.jpg',
                rating: 4.3,
                salesCount: 5
            },
            {
                artistId: artists[2]._id,
                title: 'Tech Future',
                description: 'A vision of tomorrow.',
                price: 1500,
                medium: 'Digital',
                style: 'Sci-Fi',
                images: './uploads/images-1767147683441.jpg',
                rating: 4.6,
                salesCount: 30
            },
            {
                artistId: artists[3]._id,
                title: 'Garden Bridge',
                description: 'Peaceful bridge over water.',
                price: 700,
                medium: 'Watercolor',
                style: 'Impressionism',
                images: './uploads/images-1767108677070.jpg',
                rating: 4.7,
                salesCount: 120
            },
            {
                artistId: artists[4]._id,
                title: 'Melting Clocks',
                description: 'Time is fluid.',
                price: 2000,
                medium: 'Oil',
                style: 'Surrealism',
                images: './uploads/image-1767282928141-819174746.jpg',
                rating: 5.0,
                salesCount: 300
            }
        ];

        await Artwork.insertMany(artworks);

        console.log('Database Seeded Successfully with Unique Artists!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (require.main === module) {
     seedData();
    console.log('Seeder disabled. Uncomment seedData() in seeder.js to run.');
} else {
    console.log('Seeder file loaded but not executed (use "node seeder.js" to run).');
}
