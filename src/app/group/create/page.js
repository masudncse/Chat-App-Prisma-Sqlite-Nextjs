'use client'
import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function CreateGroup() {
    const [name, setName] = useState('');
    const [userIds, setUserIds] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        const userIdsArray = userIds.split(',').map(userId => userId.trim());

        const res = await fetch('/api/group/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, userIds: userIdsArray}),
        });

        const data = await res.json();

        if (res.ok) {
            router.push('/group/create'); // Redirect to the groups list on success
        } else {
            setError(data.error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">Create Group</h2>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleCreateGroup}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="userIds" className="block text-sm font-medium text-gray-700">User Ids
                            (comma-separated user ids)</label>
                        <input
                            type="text"
                            id="userIds"
                            value={userIds}
                            onChange={(e) => setUserIds(e.target.value)}
                            required
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter user ids separated by commas.</p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
