import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ConceptsIndex from './components/ConceptsIndex';
import HowToIndex from './components/HowToIndex';
import DocPage from './components/DocPage';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/concepts" element={<ConceptsIndex />} />
        <Route path="/concepts/:slug" element={<DocPage type="concepts" />} />
        <Route path="/how-to" element={<HowToIndex />} />
        <Route path="/how-to/:slug" element={<DocPage type="how-to" />} />
        {/* Catch-all route for static files and unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </>
  );
}

export default App;
