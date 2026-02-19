import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import GenerateIdea from './pages/GenerateIdea';
import SavedIdeas from './pages/SavedIdeas';
import BlueprintView from './pages/BlueprintView';
import HistoryView from './pages/HistoryView';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans selection:bg-yellow-200 selection:text-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<GenerateIdea />} />
              <Route path="/saved" element={<SavedIdeas />} />
              <Route path="/blueprint/:id" element={<BlueprintView />} />
              <Route path="/history/:id" element={<HistoryView />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


