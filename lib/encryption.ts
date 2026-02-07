// utils/encryption.ts

/**
 * Note: Pour une démo, le chiffrement serveur est préférable.
 * Mais pour du chiffrement client "Zero Knowledge" :
 */
export async function encryptFile(file: File): Promise<{ encryptedData: ArrayBuffer, key: CryptoKey }> {
  // 1. Générer une clé unique pour CE fichier
  const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
  );

  // 2. Lire le fichier
  const fileBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Chiffrer
  const encryptedData = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      fileBuffer
  );

  return { encryptedData, key };
}