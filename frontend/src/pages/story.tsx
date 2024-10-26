import React from "react";
import { useParams } from "react-router-dom";

const Story = () => {
  let { storyId } = useParams();
  return <div>Story {storyId}</div>;
};

export default Story;
