import React from "react";

const CreationTime: React.FC<{ time: string }> = ({ time }) => {
  const date = new Date(time);

  const formattedTime = date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return <p className="text-base mb-2">Posted on {formattedTime}</p>;
};

export default CreationTime;
