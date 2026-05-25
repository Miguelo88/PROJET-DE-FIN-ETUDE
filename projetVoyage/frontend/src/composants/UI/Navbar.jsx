import { useEffect, useState } from "react";

export function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <div className="flex items-center justify-end gap-3">
      {user && (
        <div className="text-right">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      )}
    </div>
  );
}