import React from "react";

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      Home Page - <Link to="/story/123">Story 123</Link>
    </div>
  );
};

export default Home;
