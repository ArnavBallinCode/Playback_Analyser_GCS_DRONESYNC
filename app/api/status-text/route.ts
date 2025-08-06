import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const LOCAL_PATH = path.join(process.cwd(), 'public', 'params', 'status.txt');

export async function GET() {
    try {
        // Simply read the locally synced file
        const statusText = await readFile(LOCAL_PATH, 'utf-8');
        return NextResponse.json({ 
            status: 'success', 
            data: statusText.trim()
        });
    } catch (error: any) {
        // Return empty string if file doesn't exist yet
        return NextResponse.json({
            status: 'success',
            data: 'Connecting to Jetson...'
        });
    }
}