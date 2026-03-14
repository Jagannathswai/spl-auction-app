const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

console.log('🔍 Debugging:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true, limits: { fileSize: 5 * 1024 * 1024 } }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
//const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ipl-auction';
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Make io accessible to routes
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/auction', require('./routes/auction'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/export', require('./routes/export'));

// Socket.io Logic
const auctionSocket = require('./sockets/auctionSocket');
auctionSocket(io);

app.get('/', (req, res) => res.json({ message: 'IPL Auction API Running 🏏' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => 
  console.log(`🚀 Server running on port ${PORT}`)
);





// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const fileUpload = require('express-fileupload');
// const path = require('path');
// require('dotenv').config();

// console.log('🔍 Debugging:');
// console.log('MONGO_URI:', process.env.MONGO_URI);
// console.log('NODE_ENV:', process.env.NODE_ENV);

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['*']
//   }
// });

// // CORS Middleware - MUST be first
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
  
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(204);
//   }
//   next();
// });

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload({ createParentPath: true, limits: { fileSize: 5 * 1024 * 1024 } }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // DB Connection
// const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jagannathswai1_db_user:Jagga1234@cluster0.qyh8jeg.mongodb.net/ipl-auction?retryWrites=true&w=majority&appName=Cluster0';


// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // Make io accessible to routes
// app.use((req, res, next) => { req.io = io; next(); });

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/players', require('./routes/players'));
// app.use('/api/teams', require('./routes/teams'));
// app.use('/api/auction', require('./routes/auction'));
// app.use('/api/rooms', require('./routes/rooms'));
// app.use('/api/export', require('./routes/export'));

// // Socket.io Logic
// const auctionSocket = require('./sockets/auctionSocket');
// auctionSocket(io);

// app.get('/', (req, res) => res.json({ message: 'IPL Auction API Running 🏏' }));

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => 
//   console.log(`🚀 Server running on port ${PORT}`)
// );