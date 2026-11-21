const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateTokenNumber = (departmentPrefix = 'A', sequenceNumber = 1) => {
  const padded = String(sequenceNumber).padStart(2, '0');
  const prefix = departmentPrefix.trim().toUpperCase() || 'A';
  return `${prefix}-${padded}`;
};

const generateCheckInPin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateQRCodeDataUrl = async (appointmentId, checkInPin) => {
  try {
    const payload = JSON.stringify({
      appId: appointmentId.toString(),
      pin: checkInPin,
      timestamp: Date.now(),
      ref: uuidv4().slice(0, 8),
    });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return { payload, qrDataUrl };
  } catch (error) {
    console.error('Failed to generate QR Code:', error);
    return { payload: appointmentId.toString(), qrDataUrl: '' };
  }
};

module.exports = {
  generateTokenNumber,
  generateCheckInPin,
  generateQRCodeDataUrl,
};
