'use client'

import React from "react"
import { useState } from "react"

type FollowersListProps = {
}

async function fetchFollowers() {
    const res = await fetch('http://localhost:8080/api/getFollowers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to fetch followers');
    }

    const output = await res.json();
    console.log(output)
    return output;
}

const FollowersList: React.FC<FollowersListProps> = () => {
    const [checkedList, setCheckedList] = useState<number[]>([])

    const followersListData = fetchFollowers();


    return (<div>
            {}
        </div>
    )

}

export default FollowersList