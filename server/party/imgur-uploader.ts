import type {ImgurApiResponse} from "imgur";
import type * as Party from "partykit/server";

export const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CLIENT_DOMAIN || 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}


export async function sendImgur(base64Image: string): Promise<ImgurApiResponse<ImageData>> {

    const imgurResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // Замените на реальный ID
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

export async function onPost(req: Party.Request) {
    const formData = await req.formData();
    // @ts-ignore
    const file = formData.get('file') as File;

    if (!file) {
        return new Response('No file uploaded', { status: 400, headers: headers });
    }

    if (!file.type.startsWith('image/')) {
        return new Response('Only image files are allowed', { status: 400, headers: headers });
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
        return new Response(`File exceeds ${MAX_SIZE/1024/1024}MB limit`, { status: 400, headers: headers });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);
    const response = await sendImgur(base64String)

    if (!response.success) {
        console.error('Imgur API Error:', response);
        return new Response('Imgur upload failed', { status: 500, headers: headers });
    }

    return new Response(JSON.stringify(response.data), {headers: headers});
}