import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface Props {
  url: string;
}

export default function QRCodeGenerator({ url }: Props) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!url) return;

    QRCode.toDataURL(url, { width: 400, margin: 1 })
      .then(setQr)
      .catch(console.error);
  }, [url]);

  if (!url) return null;

  return (
    <img
      src={qr}
      alt="Verification QR"
      className="w-full h-full object-contain"
    />
  );
}