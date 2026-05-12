const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ===== CONTACTS =====

// GET — tous les contacts
app.get('/api/contacts', (req, res) => {
  db.query('SELECT * FROM contacts ORDER BY favori DESC, nom ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST — ajouter un contact
app.post('/api/contacts', (req, res) => {
  const { nom, email, telephone, categorie, avatar } = req.body;
  db.query(
    'INSERT INTO contacts (nom, email, telephone, categorie, avatar) VALUES (?, ?, ?, ?, ?)',
    [nom, email, telephone, categorie, avatar || null],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: results.insertId, nom, email, telephone, categorie, avatar });
    }
  );
});

// PUT — modifier un contact
app.put('/api/contacts/:id', (req, res) => {
  const { nom, email, telephone, categorie, avatar } = req.body;
  console.log('Données reçues:', req.body); 
  console.log('Avatar reçu:', avatar); 
  db.query(
    'UPDATE contacts SET nom=?, email=?, telephone=?, categorie=?, avatar=? WHERE id=?',
    [nom, email, telephone, categorie, avatar || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contact modifié !' });
    }
  );
});

// DELETE — supprimer un contact
app.delete('/api/contacts/:id', (req, res) => {
  db.query('DELETE FROM contacts WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Contact supprimé !' });
  });
});

// PUT — toggle favori
app.put('/api/contacts/:id/favori', (req, res) => {
  db.query('SELECT favori FROM contacts WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const newFavori = !results[0].favori;
    db.query('UPDATE contacts SET favori = ? WHERE id = ?', [newFavori, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ favori: newFavori });
    });
  });
});

// ===== HISTORIQUE APPELS =====

// GET — historique d'un contact
app.get('/api/contacts/:id/appels', (req, res) => {
  db.query(
    'SELECT * FROM historique_appels WHERE contact_id = ? ORDER BY date_appel DESC',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST — ajouter un appel
app.post('/api/contacts/:id/appels', (req, res) => {
  const { type_appel, duree } = req.body;
  db.query(
    'INSERT INTO historique_appels (contact_id, type_appel, duree) VALUES (?, ?, ?)',
    [req.params.id, type_appel, duree],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: results.insertId, type_appel, duree });
    }
  );
});

// GET — export CSV
app.get('/api/contacts/export/csv', (req, res) => {
  db.query('SELECT nom, email, telephone, categorie FROM contacts', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const header = 'Nom,Email,Téléphone,Catégorie\n';
    const rows = results.map(c => `${c.nom},${c.email || ''},${c.telephone || ''},${c.categorie}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(header + rows);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});