/**
 * Updated sign.js for the HUD project.
 *
 * Copy this file to your HUD project as sign.js (replace existing).
 * Also copy master_private.pem (from MeowHUD/scripts/) next to sign.js.
 *
 * What changed vs original:
 *  - hud.json is NOT signed (client needs to read it as plain JSON)
 *  - Generates key.sig: the HUD public key signed by the MeowHUD master private key
 *    so the client can verify the whole chain of trust.
 *
 * Build command stays the same:
 *   npm run sign  (calls: npm run build && node sign.js && npm-build-zip --name=signed)
 */

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __esm_dirname = path.dirname(fileURLToPath(import.meta.url));

const sign = () => {
    const getAllFilesToSign = (hudDir) => {
        const files = [];
        const getFiles = (dir) => {
            fs.readdirSync(dir).forEach(file => {
                const fileDirectory = path.join(dir, file);
                if (fs.statSync(fileDirectory).isDirectory()) return getFiles(fileDirectory);
                // Sign only .js and .css — NOT hud.json (client reads it as plain JSON)
                else if (fileDirectory.endsWith('.js') || fileDirectory.endsWith('.css')) {
                    return files.push(fileDirectory);
                }
            });
        };
        getFiles(hudDir);
        return files;
    };

    const dir = path.join(__esm_dirname, 'build');
    const keyFile = path.join(dir, 'key');
    const keySigFile = path.join(dir, 'key.sig');

    if (fs.existsSync(keyFile) && fs.existsSync(keySigFile)) {
        console.log('[sign] Already signed — skipping.');
        return true;
    }

    // ── Read HUD metadata for hudId + minPlan ────────────────────────────────
    // minPlan подписывается в key.sig: hud.json не подписан, и без этого тариф
    // худа можно было понизить правкой файла (премиум-худ на Стартере).
    let hudId = 'unknown';
    let minPlan = 'free';
    try {
        const meta = JSON.parse(fs.readFileSync(path.join(dir, 'hud.json'), 'utf8'));
        hudId = meta.name ?? hudId;
        if (typeof meta.minPlan === 'string' && meta.minPlan.trim()) minPlan = meta.minPlan.trim();
    } catch { /* ignore */ }

    // ── Read master private key ──────────────────────────────────────────────
    const masterKeyPath = path.join(__esm_dirname, 'master_private.pem');
    if (!fs.existsSync(masterKeyPath)) {
        console.error('[sign] master_private.pem not found next to sign.js!');
        console.error('       Copy it from MeowHUD/scripts/master_private.pem');
        return false;
    }
    const masterPrivateKey = fs.readFileSync(masterKeyPath, 'utf8');

    // ── Generate per-HUD RSA keypair ─────────────────────────────────────────
    const passphrase = crypto.randomBytes(48).toString('hex');
    const keys = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding:  { type: 'spki',  format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem', cipher: 'aes-256-cbc', passphrase },
    });

    // ── Sign JS/CSS files with the HUD private key ───────────────────────────
    const filesToSign = getAllFilesToSign(dir);
    if (filesToSign.length === 0) {
        console.warn('[sign] No .js/.css files found in build/');
        return false;
    }

    const fileToContent = {};
    let success = true;

    filesToSign.forEach(file => {
        if (!success) return;
        const content = fs.readFileSync(file, 'utf8');
        try {
            fileToContent[file] = jwt.sign(
                content,
                { key: keys.privateKey.toString(), passphrase },
                { algorithm: 'RS256' },
            );
        } catch (e) {
            console.error('[sign] Failed to sign', file, e.message);
            success = false;
        }
    });

    if (!success) return false;

    // Write signed file content
    filesToSign.forEach(file => fs.writeFileSync(file, fileToContent[file]));

    // Write HUD public key
    fs.writeFileSync(keyFile, keys.publicKey.toString());

    // ── Sign the HUD public key with the master key → key.sig ────────────────
    const keySig = jwt.sign(
        { key: keys.publicKey.toString(), hudId, minPlan },
        masterPrivateKey,
        { algorithm: 'RS256' },
    );
    fs.writeFileSync(keySigFile, keySig);

    console.log(`[sign] ✓ Signed ${filesToSign.length} files`);
    console.log(`[sign] ✓ key.sig created (hudId: ${hudId}, minPlan: ${minPlan})`);
    return true;
};

sign();