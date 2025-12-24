import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ConceptsIndex from './components/ConceptsIndex';
import HowToIndex from './components/HowToIndex';
import DocPage from './components/DocPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/concepts" element={<ConceptsIndex />} />
      <Route path="/concepts/:slug" element={<DocPage type="concepts" />} />
      <Route path="/how-to" element={<HowToIndex />} />
      <Route path="/how-to/:slug" element={<DocPage type="how-to" />} />
    </Routes>
  );
}

export default App;
