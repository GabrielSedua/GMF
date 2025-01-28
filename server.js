require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public, assets, and the root directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname)); // To serve logo.png directly from the root directory
app.use('/node_modules/@supabase/supabase-js', express.static(path.join(__dirname, 'node_modules', '@supabase', 'supabase-js')));

// Session setup using JWT
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/verification', (req, res) => res.sendFile(path.join(__dirname, 'public', 'verification.html')));
app.get('/assets/verification', (req, res) => res.sendFile(path.join(__dirname, 'assets', 'verification.html')));
app.get('/assets/reset-password', (req, res) => res.sendFile(path.join(__dirname, 'assets', 'reset-password.html')));
app.get('/assets/send-recovery', (req, res) => res.sendFile(path.join(__dirname, 'assets', 'send-recovery.html')));

// Protect /home route to ensure only logged-in users can access it
app.get('/home', (req, res) => {
  if (!req.session.token) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Sign-up route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔍 Signing up user:", email);

    // Sign-up request to Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("❌ Supabase sign-up error:", error.message);
      return res.status(400).json({ message: error.message });
    }

    console.log("✅ Supabase sign-up success:", data);

    // Optionally store the email in PostgreSQL
    await pool.query('INSERT INTO users (email) VALUES ($1)', [email]);

    console.log("✅ User signed up and stored in PostgreSQL. Sending verification message.");

    return res.json({
      message: 'Success! Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('❌ Server error during sign-up:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Check verification status
app.get('/check-verification-status', async (req, res) => {
  if (!req.session.token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { user, error } = await supabase.auth.api.getUser(req.session.token);

    if (error) {
      console.error("❌ Error fetching user:", error.message);
      return res.status(500).json({ message: 'Error fetching user data.' });
    }

    // Check if the user is verified
    if (user && user.email_confirmed_at) {
      return res.json({ isVerified: true });
    }

    return res.json({ isVerified: false });
  } catch (err) {
    console.error("❌ Error during verification status check:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Login route with email confirmation check
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔍 Attempting login for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const { user, session } = data;

    // If the user is not confirmed, redirect to the verification page
    if (!user || !user.confirmed_at) {
      console.warn("⚠️ Email not confirmed for:", email);
      return res.redirect('/verification'); // Redirect to verification page
    }

    // Store JWT token in session
    req.session.token = session.access_token;
    console.log("✅ User logged in:", email);

    res.redirect('/home');
  } catch (err) {
    console.error('❌ Server error during login:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Resend verification email
app.post('/resend-confirmation', async (req, res) => {
  const { email } = req.body;

  try {
    console.log("🔍 Resending confirmation email to:", email);
    const { error } = await supabase.auth.resend({ email });

    if (error) {
      console.error("❌ Resend confirmation error:", error.message);
      return res.status(400).json({ message: 'Error resending confirmation email.' });
    }

    res.json({ message: 'Confirmation email sent! Check your inbox.' });
  } catch (err) {
    console.error('❌ Error resending confirmation:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Start the server
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
