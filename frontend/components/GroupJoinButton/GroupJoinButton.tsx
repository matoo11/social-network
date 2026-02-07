"use client";
import { useState, useEffect } from "react";

const checkGroupStatus = async (groupId: number): Promise<any> => {
    const res = await fetch('http://localhost:8080/api/groups/request/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupId }),
    });

    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

const requestToJoin = async (groupId: number) => {
    const res = await fetch('http://localhost:8080/api/groups/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupId }),
    });

    if (!res.ok) throw new Error('Failed to request to join');
};

type GroupJoinButtonProps = {
    groupId: number;
};

export default function GroupJoinButton({ groupId }: GroupJoinButtonProps) {
    const [text, setText] = useState<string>("Join");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const status = await checkGroupStatus(groupId);
                if (status === 1) setText("Requested");
                else if (status === 2) setText("Joined");
                else setText("Join");
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [groupId]);

    const handleClick = async () => {
        try {
            const status = await checkGroupStatus(groupId);
            
            // Only allow requesting to join if not already joined or requested
            if (status === 0) {
                await requestToJoin(groupId);
                const updated = await checkGroupStatus(groupId);
                if (updated === 1) setText("Requested");
                else if (updated === 2) setText("Joined");
                else setText("Join");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isDisabled = text === "Joined" || text === "Requested";

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 disabled:opacity-50 text-sm"
        >
            {text}
        </button>
    );
}
