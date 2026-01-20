import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-safe';

// Chiffre n'importe quel objet ou texte
export const encryptData = (data: any): string => {
    const str = JSON.stringify(data);
    return CryptoJS.AES.encrypt(str, SECRET_KEY).toString();
};

// Déchiffre et redonne l'objet original
export const decryptData = (ciphertext: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText) return null;
        return JSON.parse(originalText);
    } catch (e) {
        console.error("Erreur de déchiffrement :", e);
        return null;
    }
};