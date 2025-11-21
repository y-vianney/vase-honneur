require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ADMIN_USERNAME = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "vaseshonneur2025";
const JWT_SECRET = process.env.JWT_SECRET;

// --- CONNEXION MONGO OPTIMISÉE POUR VERCEL ---
let isConnected = false; // Variable globale pour suivre l'état

const connectToDatabase = async () => {
    if (isConnected) return;

    // Utiliser la variable d'environnement process.env.MONGO_URI
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB Connecté (Mise en cache)');
};

// On se connecte avant chaque requête si nécessaire
router.use(async (req, res, next) => {
    await connectToDatabase();
    next();
});

// --- MODÈLE DE DONNÉES (SCHEMA) ---
const InscriptionSchema = new mongoose.Schema({
    ticketId: String,
    name: String,
    email: String,
    phone: String,
    date: String,
    event: String
});

const Inscription = mongoose.model('Inscription', InscriptionSchema);

// --- MIDDLEWARES ---

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) return res.status(401).json({ error: "Accès refusé. Token manquant." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide ou expiré." });
        req.user = user;
        next();
    });
}

// --- ROUTES (API) ---

// 1. Enregistrer une personne (POST)
router.post('/register', async (req, res) => {
    try {
        const nouvelleInscription = new Inscription(req.body);
        await nouvelleInscription.save();
        res.status(201).json({ message: "Inscription réussie", data: nouvelleInscription });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
});

// 2. ROUTE PUBLIQUE : Login Admin (Pour obtenir le token)
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Vérification simple (hardcodée pour un seul admin)
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Création du token (valable 24h)
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Identifiants incorrects" });
    }
});

// 3. Récupérer tous les inscrits pour le tableau de bord (GET)
router.get('/registrants', authenticateToken, async (req, res) => {
    try {
        const inscrits = await Inscription.find().sort({ _id: -1 });
        res.json(inscrits);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les données" });
    }
});

// 3. Supprimer un inscrit (DELETE)
router.delete('/registrants/:id', authenticateToken, async (req, res) => {
    try {
        await Inscription.findOneAndDelete({ ticketId: req.params.id });
        res.json({ message: "Supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur de suppression" });
    }
});

module.exports = router;