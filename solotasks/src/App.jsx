// src/App.jsx
import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { PersistGate } from "redux-persist/integration/react";
import { ErrorBoundary } from "react-error-boundary";
import { auth, db } from "./firebase/config";
import { setUser } from "./store/slices/authSlice";
import { persistor } from "./store";
import { doc, getDoc } from "firebase/firestore";
import { fetchUserStats } from "./store/slices/userStatsSlice";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/pages/Dashboard";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Profile from "./components/pages/Profile";
import Achievements from "./components/pages/Achievements";
import QuestChainBuilder from "./components/pages/QuestChainBuilder";
import NotFound from "./components/pages/NotFound";
import SystemNotification from "./components/ui/SystemNotification";

// Scroll to top component for better UX when navigating between pages
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Error Fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-system-black p-6">
      <div className="bg-system-gray p-8 rounded-lg shadow-lg max-w-md w-full border border-red-500">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Something went wrong
        </h2>
        <p className="text-white mb-4">
          The application encountered an error. Please try refreshing the page.
        </p>
        <pre className="bg-system-black p-4 rounded text-red-300 text-sm mb-4 overflow-auto max-h-40">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-system-purple-600 text-white p-2 rounded hover:bg-system-purple-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

// Loading screen component
const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-system-black">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-system-purple-500 mb-4"></div>
    <p className="text-system-purple-300 text-lg">{message}</p>
  </div>
);

// Auth state observer wrapper with enhanced user data fetching
const AuthObserver = ({ children }) => {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          let userData = { uid: user.uid, email: user.email };

          if (userDoc.exists()) {
            // Add relevant user data to auth state
            userData = {
              ...userData,
              username: userDoc.data().username,
              profileImageUrl: userDoc.data().profileImageUrl,
              createdAt: userDoc.data().createdAt,
            };
          }

          dispatch(setUser(userData));

          // Fetch user stats in background
          dispatch(fetchUserStats(user.uid));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        dispatch(setUser(null));
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (!authChecked) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return children;
};

const App = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PersistGate
        loading={<LoadingScreen message="Preparing your quests..." />}
        persistor={persistor}
      >
        <BrowserRouter>
          <AuthObserver>
            <ScrollToTop />
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <>
                <Routes>
                  <Route
                    path="/"
                    element={user ? <MainLayout /> : <Navigate to="/login" />}
                  >
                    <Route
                      index
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route
                      path="dashboard"
                      element={
                        <Suspense
                          fallback={
                            <LoadingScreen message="Loading dashboard..." />
                          }
                        >
                          <Dashboard />
                        </Suspense>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <Suspense
                          fallback={
                            <LoadingScreen message="Loading profile..." />
                          }
                        >
                          <Profile />
                        </Suspense>
                      }
                    />
                    <Route
                      path="achievements"
                      element={
                        <Suspense
                          fallback={
                            <LoadingScreen message="Loading achievements..." />
                          }
                        >
                          <Achievements />
                        </Suspense>
                      }
                    />
                    <Route
                      path="quest-chains"
                      element={
                        <Suspense
                          fallback={
                            <LoadingScreen message="Loading dungeon builder..." />
                          }
                        >
                          <QuestChainBuilder />
                        </Suspense>
                      }
                    />
                  </Route>
                  <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to="/dashboard" />}
                  />
                  <Route
                    path="/register"
                    element={
                      !user ? <Register /> : <Navigate to="/dashboard" />
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: "#2a2a2a",
                      color: "#fff",
                      border: "1px solid #6728ff",
                    },
                    success: {
                      iconTheme: {
                        primary: "#6728ff",
                        secondary: "#fff",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#ff4b4b",
                        secondary: "#fff",
                      },
                    },
                    duration: 4000,
                  }}
                />
                <SystemNotification />
              </>
            )}
          </AuthObserver>
        </BrowserRouter>
      </PersistGate>
    </ErrorBoundary>
  );
};

export default App;
