import React, { useEffect, useRef, useState } from "react";
import { UserCircle, LogOut, Settings } from "lucide-react";
import { getUser, logoutUser } from "../store/auth";

interface Props {
  onOpenAuth: () => void;
}

const Navbar: React.FC<Props> = ({ onOpenAuth }) => {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.reload();
  };

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2 rounded-xl shadow-md font-medium hover:scale-105 transition-all"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:scale-110 transition-all"
      >
        <UserCircle
          size={42}
          className="text-sky-500 dark:text-sky-400"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">

              <UserCircle
                size={42}
                className="text-sky-500 dark:text-sky-400"
              />

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400 break-all">
                  {user.email}
                </p>
              </div>

            </div>
          </div>


          <button

          
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      )}
    </div>
  );
};

export default Navbar;