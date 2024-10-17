import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
    const { name, userIds } = await req.json();

    try {
        const group = await prisma.group.create({
            data: {
                name,
                users: {
                    connect: userIds.map(id => ({ id: Number(id) })),
                },
            },
            include: {
                users: true,
            },
        });

        return NextResponse.json({ group }, { status: 201 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Error creating group' }, { status: 400 });
    }
}
