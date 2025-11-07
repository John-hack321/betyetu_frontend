'use client'
import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeProps {
    code: string
}

export default function GeneratedQrCode({code}: QrCodeProps){
    return (
        <div className="p-2 bg-white rounded">
            <QRCodeCanvas 
                value={code}
                size={200}
                level="H"
                includeMargin={false}
            />
        </div>
    )
}