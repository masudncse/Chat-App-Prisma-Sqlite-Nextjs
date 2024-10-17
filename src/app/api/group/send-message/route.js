import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
    const token = req.headers.get('authorization')?.split(' ')[1]; // Using .get for headers
    const { text, groupId } = await req.json(); // Parse JSON body

    try {
        const decoded = verifyToken(token);

        // Check if the user is a member of the group
        const group = await prisma.group.findUnique({
            where: { id: Number(groupId) },
            include: { users: true },
        });

        if (!group || !group.users.some(user => user.id === decoded.id)) {
            return NextResponse.json({ error: 'User not part of this group' }, { status: 403 });
        }

        const newMessage = await prisma.message.create({
            data: {
                text,
                userId: decoded.id,
                groupId: Number(groupId),
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json(newMessage, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
    }
}
