"use client";
import { useState, useEffect } from "react";

const checkfollow = async (userID: number): Promise<any> => {
    const res = await fetch('http://localhost:8080/api/checkFollowStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userID }),
    });

    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

const follow = async (userID: number) => {
    const res = await fetch('http://localhost:8080/api/addFollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userID }),
    });

    if (!res.ok) throw new Error('Failed to fetch');
};

const unfollow = async (userID: number) => {
    const res = await fetch('http://localhost:8080/api/unFollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userID }),
    });

    if (!res.ok) throw new Error('Failed to fetch');

};

const cancelRequest = async (userID: number) => {
    const res = await fetch('http://localhost:8080/api/follow/cancelRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userID }),
    });

    if (!res.ok) throw new Error('Failed to cancel request');
};

type FollowButtonProps = {
    userID: number;
};

export default function FollowButton({ userID }: FollowButtonProps) {
    const [text, setText] = useState<string>("Follow");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await checkfollow(userID);
                if (data === 1) setText("requested");
                else if (data === 2) setText("following");
                else setText("follow");
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [userID]);

    const handleClick = async () => {
        try {
            const status = await checkfollow(userID);
            console.log(status)
            if (status === 3) {
                await follow(userID);
            } else if (status === 2) {
                await unfollow(userID);
            } else if (status === 1) {
                await cancelRequest(userID);
            }

            const updated = await checkfollow(userID);
            if (updated === 1) setText("requested");
            else if (updated === 2) setText("following");
            else setText("follow");

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="flex-shrink-0 w-20 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 rounded-lg transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
        >
            {text}
        </button>
    );
}
