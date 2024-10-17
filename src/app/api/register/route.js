import {PrismaClient} from '@prisma/client';
import {hashPassword} from '@/lib/auth';
import {NextResponse} from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const {username, email, password} = body;

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({message: 'User created successfully', user: newUser}, {status: 201});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: 'User already exists or invalid data'}, {status: 400});
    }
}

export function OPTIONS() {
    return NextResponse.json({message: 'Method not allowed'}, {status: 405});
}
