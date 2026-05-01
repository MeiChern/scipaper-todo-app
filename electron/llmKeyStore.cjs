const { safeStorage } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const keyDir = path.join(os.homedir(), 'Documents', 'SciPaperTodo', 'keys');
const providerIdPattern = /^[a-zA-Z0-9_-]{1,64}$/;
const encryptionUnavailableMessage =
  '系统未启用加密钥匙串,无法保存 API Key (可能在 WSL 或无 keychain 环境)';

let hasWarnedEncryptionUnavailable = false;

function validateProviderId(providerId) {
  if (typeof providerId !== 'string' || !providerIdPattern.test(providerId)) {
    throw new Error('invalid provider id');
  }
}

function getKeyPath(providerId) {
  return path.join(keyDir, `${providerId}.bin`);
}

function ensureKeyDir() {
  fs.mkdirSync(keyDir, { recursive: true });
}

function isEncryptionAvailable() {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch (error) {
    return false;
  }
}

function warnEncryptionUnavailableOnce() {
  if (hasWarnedEncryptionUnavailable) {
    return;
  }

  console.warn(encryptionUnavailableMessage);
  hasWarnedEncryptionUnavailable = true;
}

function setKey(providerId, plaintext) {
  validateProviderId(providerId);

  if (!isEncryptionAvailable()) {
    throw new Error(encryptionUnavailableMessage);
  }

  ensureKeyDir();

  const encrypted = safeStorage.encryptString(plaintext);
  fs.writeFileSync(getKeyPath(providerId), encrypted);
}

function getKey(providerId) {
  validateProviderId(providerId);

  if (!isEncryptionAvailable()) {
    warnEncryptionUnavailableOnce();
    return null;
  }

  try {
    const encrypted = fs.readFileSync(getKeyPath(providerId));
    return safeStorage.decryptString(encrypted);
  } catch (error) {
    return null;
  }
}

function deleteKey(providerId) {
  validateProviderId(providerId);
  isEncryptionAvailable();

  const filePath = getKeyPath(providerId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function hasKey(providerId) {
  validateProviderId(providerId);
  isEncryptionAvailable();

  return fs.existsSync(getKeyPath(providerId));
}

module.exports = {
  setKey,
  getKey,
  deleteKey,
  hasKey,
};
