require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabaseService = require('./server/supabaseService');

const DB_PATH = path.join(__dirname, 'server', 'data', 'db.json');

async function migrate() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            console.log('No db.json found. Skipping migration.');
            return;
        }

        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        const settings = db.settings || {};

        console.log('Migrating settings to Supabase...');
        await supabaseService.updateSettings(settings);
        console.log('✦ Settings migrated successfully!');

        // Optional: Migrate products if needed, but they are already in Supabase mostly.
        // This is primarily for the 'settings' which were local.
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
