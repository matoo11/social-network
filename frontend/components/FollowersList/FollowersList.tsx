'use client'

import React from "react"
import { useState ,useEffect} from "react"
import FollowerCard from "../FollowerCard/FollowerCard"

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

interface Follower {
  FollowerID: number;
  FollowerUsername: string;
  FollowerAvatarURL: string;
}

const FollowersList: React.FC = () => {
  const [followersListData, setFollowersListData] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedList, setCheckedList] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFollowers(); // wait for the async function
        setFollowersListData(data);
      } catch (error) {
        console.error("Failed to fetch followers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // call the async function inside useEffect
  }, []); // empty deps array → runs only once after first render

  if (loading) {
    return <div>Loading followers...</div>;
  }

  return (
    <div>
      {followersListData.map((follower) => (
        console.log(follower.FollowerID),
        <FollowerCard
          key={follower.FollowerID}
          userID={follower.FollowerID}
          username={follower.FollowerUsername}
          avatarUrl={follower.FollowerAvatarURL}
          onCheckChange={(checked) =>
            console.log(`${follower.FollowerID} checked:`, checked)
          }
        />
      ))}
    </div>
  );
};


export default FollowersList