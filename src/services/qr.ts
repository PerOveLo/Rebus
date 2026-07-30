import QRCode from 'qrcode';

// QR-generering skjer helt lokalt – ingenting sendes noe sted.
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'L',
    margin: 2,
    width: 480,
    color: { dark: '#123044', light: '#ffffff' },
  });
}
