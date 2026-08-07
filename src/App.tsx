import { HashRouter, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { StartScreen } from './screens/StartScreen';
import { JoinScreen } from './screens/JoinScreen';
import { SafetyScreen } from './screens/SafetyScreen';
import { PlayScreen } from './screens/PlayScreen';
import { PostScreen } from './screens/PostScreen';
import { RoadGameScreen } from './screens/RoadGameScreen';
import { CelebrationScreen } from './screens/CelebrationScreen';
import { LeaderScreen } from './screens/LeaderScreen';
import { PresentationScreen } from './screens/PresentationScreen';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/start" element={<StartScreen />} />
        <Route path="/join/:data" element={<JoinScreen />} />
        <Route path="/safety" element={<SafetyScreen />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/post/:num" element={<PostScreen />} />
        <Route path="/road/:num" element={<RoadGameScreen />} />
        <Route path="/celebration" element={<CelebrationScreen />} />
        <Route path="/leader" element={<LeaderScreen />} />
        <Route path="/presentation" element={<PresentationScreen />} />
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </HashRouter>
  );
}
