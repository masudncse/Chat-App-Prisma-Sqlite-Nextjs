import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        // Fetch groups with their associated users
        const groups = await prisma.group.findMany({
            include: {
                users: true, // Include users related to each group
            },
        });

        return new Response(JSON.stringify(groups), { status: 200 }); // Send the groups data in the response
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 }); // Handle errors
    }
}

// For unsupported methods, create a catch-all route
export async function OPTIONS() {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 }); // Handle unsupported methods
}
