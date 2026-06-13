import React from 'react';
import { useMetronome } from './hooks/useMetronome';
import { useTapTempo } from './hooks/useTapTempo';
import { MetronomeControls } from './components/MetronomeControls';
import { MeterEditor } from './components/meter-editor';

/**
 * App Component
 * 
 * The main application shell that integrates the metronome logic,
 * user controls, and the meter editor.
 */
const App: React.FC = () => {
  const {
    bpm,
    meterConfig,
    isPlaying,
    currentBeatIndex,
    togglePlay,
    setBpm,
    setMeter,
  } = useMetronome();

  // Integrated tap tempo logic
  const { tap } = useTapTempo((newBpm) => {
    setBpm(newBpm);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
            Metlonome
          </h1>
          <p className="text-slate-500 font-medium">
            High-precision polyrhythmic metronome
          </p>
        </header>

        <main className="space-y-8">
          {/* Controls Section */}
          <section aria-label="Metronome Controls">
            <MetronomeControls
              bpm={bpm}
              isPlaying={isPlaying}
              onBpmChange={setBpm}
              onTogglePlay={togglePlay}
              onTap={tap}
            />
          </section>

          {/* Meter Editor Section */}
          <section aria-label="Meter Editor" className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">
                Meter Configuration
              </h2>
              <div className="text-sm font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Beat: {isPlaying ? currentBeatIndex + 1 : '-'} / {meterConfig.beats.length}
              </div>
            </div>
            
            <MeterEditor
              config={meterConfig}
              onChange={setMeter}
              activeBeatIndex={isPlaying ? currentBeatIndex : undefined}
            />
          </section>
        </main>

        <footer className="pt-12 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Metlonome. Built with precision.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
