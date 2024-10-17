import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
    const groupId = parseInt(params.id, 10); // Get groupId from params
    const token = req.headers.get('authorization')?.split(' ')[1]; // Using .get for headers

    try {
        const decoded = verifyToken(token);

        // Verify if the user belongs to the group
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { users: true },
        });

        if (!group || !group.users.some(user => user.id === decoded.id)) {
            return NextResponse.json({ error: 'Unauthorized access to this group' }, { status: 403 });
        }

        const messages = await prisma.message.findMany({
            where: { groupId },
            include: { user: true },
        });

        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
    }
}
