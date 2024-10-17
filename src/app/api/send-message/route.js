import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const body = await req.json();
        const { text } = body;

        const newMessage = await prisma.message.create({
            data: {
                text,
                userId: decoded.id,
            },
        });

        return NextResponse.json(newMessage, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export function OPTIONS() {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
