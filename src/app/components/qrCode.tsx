'use client'
import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeProps {
    code: string
}

export default function GeneratedQrCode({code}: QrCodeProps){
    return <QRCodeCanvas value={code}/>
}