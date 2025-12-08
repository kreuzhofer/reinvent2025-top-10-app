import './App.css'
import { ScoreProvider } from './context/ScoreContext'
import ScoreDisplay from './components/ScoreDisplay'

function App() {
  return (
    <ScoreProvider>
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <ScoreDisplay />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-reinvent-purple">
            AWS re:Invent 2025 Quiz App
          </h1>
          <p className="text-xl text-gray-300">
            Project structure initialized successfully!
          </p>
          <p className="text-sm text-gray-400 mt-4">
            ScoreDisplay component is now visible in the top-right corner
          </p>
        </div>
      </div>
    </ScoreProvider>
  )
}

export default App
