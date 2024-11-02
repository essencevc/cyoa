import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex justify-between items-center h-[120px] max-w-2xl w-full mx-auto">
      <Link to="/" className="text-2xl underline">
        Choose Your Own Adventure
      </Link>
    </div>
  );
};

export default Header;
