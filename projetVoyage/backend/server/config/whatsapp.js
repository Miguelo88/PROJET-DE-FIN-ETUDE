// config/whatsapp.js
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

let sock = null;

async function connecterWhatsApp() {
  // Conserve la session dans un dossier pour ne pas rescanner le QR code à chaque redémarrage
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_whatsapp");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // On gère l'affichage nous-mêmes proprement
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("✨ Scannez ce QR Code avec votre application WhatsApp (Appareils connectés) :");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("🔄 Connexion WhatsApp perdue. Reconnexion...", shouldReconnect);
      if (shouldReconnect) connecterWhatsApp();
    } else if (connection === "open") {
      console.log("✅ WhatsApp est connecté avec succès !");
    }
  });

  return sock;
}

// Fonction globale pour envoyer un message depuis n'importe où dans l'application
async function envoyerMessageWhatsApp(numero, texte) {
  if (!sock) {
    console.error("❌ WhatsApp n'est pas initialisé.");
    return;
  }
  // Formatage requis pour WhatsApp : le numéro doit finir par @s.whatsapp.net
  const jid = `${numero.replace(/\+/g, "").trim()}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: texte });
}

module.exports = { connecterWhatsApp, envoyerMessageWhatsApp };
