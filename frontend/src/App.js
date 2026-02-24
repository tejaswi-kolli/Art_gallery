import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import AboutUs from './pages/AboutUs';
import Home from './pages/Home';
import LoginSelection from './pages/LoginSelection';
import BuyerLogin from './pages/BuyerLogin';
import BuyerRegister from './pages/BuyerRegister';
import ArtistLogin from './pages/ArtistLogin';
import ArtistRegister from './pages/ArtistRegister';
import UploadArtwork from './pages/UploadArtwork';
import EditArtwork from './pages/EditArtwork';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtworkDetails from './pages/ArtworkDetails';
import ArtistAnalytics from './pages/ArtistAnalytics'; // Placeholder for next step
import BuyerProfile from './pages/BuyerProfile';
import ArtistProfileEdit from './pages/ArtistProfileEdit';
import VerifyEmail from './pages/VerifyEmail';
import AccountSettings from './pages/AccountSettings';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import Community from './pages/Community';
import ArtistProfile from './pages/ArtistProfile'; // Public view of artist
import Analytics from './pages/Analytics';

// Styles
import './App.css';

import CursorAnimation from './components/CursorAnimation';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="app-container">
          <ScrollToTop />
          <CursorAnimation />
          <Sidebar />

          <div className="main-wrapper">
            <TopBar />
            <main className="main-content">
              <Routes>
                <Route path="/about" element={<AboutUs />} />
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ArtworkDetails />} />
                <Route path="/login" element={<LoginSelection />} />
                <Route path="/register" element={<LoginSelection />} />

                {/* Buyer Auth */}
                <Route path="/buyer/login" element={<BuyerLogin />} />
                <Route path="/buyer/register" element={<BuyerRegister />} />

                {/* Artist Auth */}
                <Route path="/artist/login" element={<ArtistLogin />} />
                <Route path="/artist/register" element={<ArtistRegister />} />

                {/* Profiles */}
                <Route path="/artist/edit-profile" element={<ArtistProfileEdit />} />

                {/* Account Settings (Common) */}
                <Route path="/account-settings" element={<AccountSettings />} />

                {/* Verification */}
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Private Routes */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/success" element={<OrderSuccess />} />

                {/* Artist Dashboard Routes */}
                <Route path="/dashboard" element={<ArtistDashboard />} />
                <Route path="/dashboard/upload" element={<UploadArtwork />} />
                <Route path="/dashboard/edit/:id" element={<EditArtwork />} />
                <Route path="/dashboard/analytics" element={<Analytics />} />
                <Route path="/community" element={<Community />} />

                {/* Public Artist Profile */}
                <Route path="/artist/:id" element={<ArtistProfile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
