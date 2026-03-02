import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ruler, 
  Home, 
  Layers, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ArrowLeft,
  Volume2,
  Waves,
  FileText,
  Download,
  ShieldAlert,
  X,
  Menu
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { RoomState, AcousticResults } from './types';
import { MATERIALS, ROOM_TYPES, REFERENCES } from './constants';
import { calculateAcoustics } from './utils/acoustics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [step, setStep] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [roomState, setRoomState] = useState<RoomState>({
    dimensions: { length: 4, width: 3, height: 2.5 },
    typeId: 'bedroom',
    surfaces: {
      floor: 'wood',
      walls: 'plasterboard',
      ceiling: 'ceiling-plaster',
    },
  });

  const results = useMemo(() => calculateAcoustics(roomState), [roomState]);

  const handleDimensionChange = (key: keyof typeof roomState.dimensions, value: number) => {
    setRoomState(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [key]: value }
    }));
  };

  const handleSurfaceChange = (key: keyof typeof roomState.surfaces, value: string) => {
    setRoomState(prev => ({
      ...prev,
      surfaces: { ...prev.surfaces, [key]: value }
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      // Ensure the element is visible for capture
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 800, // Fixed width for consistent PDF layout
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EchoSense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Waves size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">EchoSense</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowInfo(true)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/60"
            aria-label="Information"
          >
            <Info size={20} />
          </button>
          <div className="text-xs font-medium text-black/40 uppercase tracking-widest hidden sm:block">
            Step {step} of 3
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-6 pb-40">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="text-emerald-600" size={20} />
                  <h2 className="text-lg font-medium">Room Dimensions</h2>
                </div>
                <p className="text-sm text-black/60 mb-6">Enter the size of your space in meters.</p>
                
                <div className="grid grid-cols-1 gap-4">
                  {(['length', 'width', 'height'] as const).map((dim) => (
                    <div key={dim} className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">
                        {dim} (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomState.dimensions[dim]}
                        onChange={(e) => handleDimensionChange(dim, parseFloat(e.target.value) || 0)}
                        className="w-full text-2xl font-medium focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Home className="text-emerald-600" size={20} />
                  <h2 className="text-lg font-medium">Room Type</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {ROOM_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRoomState(prev => ({ ...prev, typeId: type.id }))}
                      className={cn(
                        "text-left p-4 rounded-2xl border transition-all duration-200",
                        roomState.typeId === type.id 
                          ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                          : "bg-white border-black/5 hover:border-black/10"
                      )}
                    >
                      <div className="font-medium mb-1">{type.name}</div>
                      <div className="text-xs text-black/50 leading-relaxed">{type.description}</div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="text-emerald-600" size={20} />
                  <h2 className="text-lg font-medium">Surface Materials</h2>
                </div>
                <p className="text-sm text-black/60 mb-6">Select the primary material for each surface.</p>

                <div className="space-y-6">
                  {(['floor', 'walls', 'ceiling'] as const).map((surface) => (
                    <div key={surface} className="space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-black/40">
                        {surface}
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {MATERIALS.filter(m => m.category === surface || (surface === 'walls' && m.category === 'wall')).map((material) => (
                          <button
                            key={material.id}
                            onClick={() => handleSurfaceChange(surface, material.id)}
                            className={cn(
                              "text-left px-4 py-3 rounded-xl border text-sm transition-all",
                              roomState.surfaces[surface] === material.id
                                ? "bg-emerald-50 border-emerald-200 font-medium"
                                : "bg-white border-black/5 hover:border-black/10"
                            )}
                          >
                            {material.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Visible Results */}
              <div className="space-y-8">
                <section className="bg-white rounded-3xl p-8 border border-black/5 shadow-xl text-center">
                  <div className="mb-6 inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600">
                    <Volume2 size={32} />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-black/40 mb-2">
                    Estimated RT60
                  </h2>
                  <div className="text-6xl font-light tracking-tighter mb-4">
                    {results.rt60.toFixed(2)}<span className="text-2xl ml-1 opacity-40">s</span>
                  </div>
                  
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                    results.status === 'good' ? "bg-emerald-100 text-emerald-700" :
                    results.status === 'fair' ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  )}>
                    {results.status === 'good' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    Acoustics: {results.status.toUpperCase()}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Info size={20} className="text-emerald-600" />
                    Design Suggestions
                  </h3>
                  <div className="space-y-3">
                    {results.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-2xl border border-black/5 flex gap-4 items-start"
                      >
                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <ChevronRight size={14} />
                        </div>
                        <p className="text-sm leading-relaxed text-black/70">{rec}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-black text-white p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest opacity-50">Technical Summary</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs opacity-40 mb-1">Volume</div>
                      <div className="text-lg font-medium">{results.volume.toFixed(1)} m³</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-40 mb-1">Absorption</div>
                      <div className="text-lg font-medium">{results.totalAbsorption.toFixed(2)} Sabins</div>
                    </div>
                  </div>
                </section>

                {/* Export Button */}
                <button
                  onClick={exportPDF}
                  disabled={isExporting}
                  className="w-full bg-white border border-black/10 p-4 rounded-2xl flex items-center justify-center gap-2 font-medium hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {isExporting ? 'Generating Report...' : 'Export PDF Report'}
                </button>
              </div>

              {/* Hidden Report for PDF Export */}
              <div className="fixed left-[-9999px] top-0">
                <div ref={reportRef} className="w-[800px] p-12 bg-white space-y-12" style={{ backgroundColor: '#ffffff', color: '#1a1a1a' }}>
                  <div className="flex items-center justify-between border-b pb-8" style={{ borderBottomColor: 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#059669' }}>
                        <Waves size={24} />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#111827' }}>EchoSense Report</h1>
                    </div>
                    <div className="text-right">
                      <div className="text-sm uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Date</div>
                      <div className="font-medium" style={{ color: '#1a1a1a' }}>{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Acoustic Analysis</h2>
                      <div className="p-10 rounded-3xl text-center border flex flex-col items-center justify-center" style={{ backgroundColor: '#ecfdf5', borderColor: '#d1fae5', minHeight: '240px' }}>
                        <div className="text-sm uppercase tracking-widest mb-4" style={{ color: 'rgba(6, 78, 59, 0.6)' }}>RT60 Result</div>
                        <div className="text-8xl font-light tracking-tighter leading-none" style={{ color: '#064e3b' }}>
                          {results.rt60.toFixed(2)}<span style={{ fontSize: '0.3em', marginLeft: '4px', opacity: 0.4 }}>s</span>
                        </div>
                        <div className="mt-10 inline-flex items-center gap-2 px-6 py-2 text-white rounded-full text-sm font-medium" style={{ backgroundColor: '#059669' }}>
                          Status: {results.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Room Details</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl flex flex-col justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.05)', minHeight: '100px' }}>
                          <div className="text-[10px] uppercase mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>Volume</div>
                          <div className="text-xl font-medium" style={{ color: '#1a1a1a' }}>{results.volume.toFixed(1)} m³</div>
                        </div>
                        <div className="p-6 rounded-2xl flex flex-col justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.05)', minHeight: '100px' }}>
                          <div className="text-[10px] uppercase mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>Absorption</div>
                          <div className="text-xl font-medium" style={{ color: '#1a1a1a' }}>{results.totalAbsorption.toFixed(2)} Sabins</div>
                        </div>
                        <div className="p-6 rounded-2xl flex flex-col justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.05)', minHeight: '100px' }}>
                          <div className="text-[10px] uppercase mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>Room Type</div>
                          <div className="text-sm font-medium leading-tight" style={{ color: '#1a1a1a' }}>{ROOM_TYPES.find(t => t.id === roomState.typeId)?.name}</div>
                        </div>
                        <div className="p-6 rounded-2xl flex flex-col justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.05)', minHeight: '100px' }}>
                          <div className="text-[10px] uppercase mb-2" style={{ color: 'rgba(0,0,0,0.4)' }}>Target</div>
                          <div className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{ROOM_TYPES.find(t => t.id === roomState.typeId)?.targetRT60.join(' - ')}s</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Recommendations</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {results.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 rounded-2xl flex gap-4 items-start" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 text-xs" style={{ backgroundColor: '#059669' }}>
                            {i + 1}
                          </div>
                          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.7)' }}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-12 border-t space-y-8" style={{ borderTopColor: 'rgba(0,0,0,0.1)' }}>
                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Disclaimer</h3>
                        <p className="text-[9px] leading-relaxed italic" style={{ color: 'rgba(0,0,0,0.5)' }}>
                          Conceptual use only. Calculations based on Sabine's Formula. Professional acoustic consultation must be sought for critical design decisions.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>References</h3>
                        <div className="space-y-1">
                          {REFERENCES.map(ref => (
                            <div key={ref.id} className="text-[9px]" style={{ color: 'rgba(0,0,0,0.5)' }}>
                              {ref.author} ({ref.year}). {ref.title}.
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-[10px]" style={{ color: 'rgba(0,0,0,0.3)' }}>
                      © 2026 Balaji Venkatachary
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-[10px] text-black/30 text-center">
          © 2026 Balaji Venkatachary
        </div>
      </main>

      {/* Info Drawer */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">Information</h2>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldAlert size={20} />
                    <h3 className="font-semibold uppercase tracking-wider text-xs">Disclaimer</h3>
                  </div>
                  <p className="text-sm text-black/60 leading-relaxed italic">
                    EchoSense is a conceptual tool for educational and preliminary planning purposes. 
                    Calculations utilize standard acoustic formulas which may not account for all architectural variables. 
                    Professional acoustic engineers should be consulted for final design and implementation.
                  </p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <FileText size={20} className="hidden" /> {/* Placeholder for icon if needed */}
                    <h3 className="font-semibold uppercase tracking-wider text-xs">Scientific Grounding</h3>
                  </div>
                  <div className="space-y-4">
                    {REFERENCES.map((ref) => (
                      <div key={ref.id} className="p-4 bg-black/5 rounded-2xl text-xs">
                        <div className="font-medium text-black/80 mb-1">{ref.title}</div>
                        <div className="text-black/50">{ref.author}, {ref.year}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="pt-8 border-t border-black/5 text-center">
                  <div className="text-xs text-black/40">
                    © 2026 Balaji Venkatachary
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 bg-white border border-black/10 h-14 rounded-2xl flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex-[2] bg-emerald-600 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-medium shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
            >
              Next Step
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="flex-[2] bg-black text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform"
            >
              Start Over
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
