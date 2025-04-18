// src/components/layout/MainLayout.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import SystemNotification from "../ui/SystemNotification";
import { auth } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { setUser } from "../../store/slices/authSlice";
import { fetchUserStats } from "../../store/slices/userStatsSlice";
import { fetchQuests } from "../../store/slices/questsSlice";

const MainLayout = () => {
  const dispatch = useDispatch();
  const { showSidebar } = useSelector((state) => state.ui);
  const { showNotification } = useSelector((state) => state.ui);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
          })
        );
        dispatch(fetchUserStats(user.uid));
        dispatch(fetchQuests(user.uid));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-system-black text-white font-system">
      {showSidebar && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-system-black to-system-gray">
          <Outlet />
        </main>
      </div>
      {showNotification && <SystemNotification />}
    </div>
  );
};

export default MainLayout;
