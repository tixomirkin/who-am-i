import type {ImgurApiResponse} from "imgur";

export async function sendImgur(base64Image: string): Promise<ImgurApiResponse<ImageData>> {

    const imgurResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            'Authorization': `Client-ID 83d182b451a8ca3`, // Замените на реальный ID
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: base64Image,
            type: 'base64',
            title: 'Uploaded via Who-am-i game',
            description: 'Uploaded at ' + new Date().toISOString()
        })
    });

    return imgurResponse.json()
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192; // Обрабатываем чанками для больших файлов

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }

    return btoa(binary);
}