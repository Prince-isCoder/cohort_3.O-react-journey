
import React from "react";

const Navbar = ({ setToggle }) => {
  return (
    <div className="p-4 flex rounded items-center bg-black justify-between">
      <div>
        <img
          className="rounded-full"
          width={35}
          src="https://i.pinimg.com/1200x/48/b5/b1/48b5b136e77ca7f45ee1a806a791370a.jpg"
          alt=""
        />
      </div>

      <div className="flex gap-6 font-semibold text-white">
        <p>Home</p>
        <p>About</p>
        <p>Contact</p>
      </div>

      <button onClick={() => setToggle((prev) => !prev)} className="p-2 bg-blue-700 text-white cursor-pointer rounded">
        Create users
      </button>
    </div>
  );
};

export default Navbar;
