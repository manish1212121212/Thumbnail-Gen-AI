
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { 
  GeneratedImage, AspectRatio, ThumbnailPreset, ImageAdjustments, 
  EditorTab, User, AuthMode, TOKEN_COST_PER_GEN, FREE_MONTHLY_TOKENS,
  PURCHASE_TOKEN_AMOUNT, PURCHASE_PRICE_INR 
} from './types';
import { Icons, THUMBNAIL_PRESETS } from './constants';

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  sepia: 0
};

const PaymentModal: React.FC<{ isOpen: boolean, onClose: () => void, onPurchase: () => void }> = ({ isOpen, onClose, onPurchase }) => {
  const [step, setStep] = useState<'scan' | 'verify' | 'success'>('scan');
  const [utr, setUtr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handlePaidClick = () => setStep('verify');

  const handleVerifyPayment = () => {
    if (utr.length < 8) return;
    setIsVerifying(true);
    // Simulate payment verification with the bank
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');
      onPurchase();
    }, 2500);
  };

  const resetAndClose = () => {
    setStep('scan');
    setUtr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar">
        {step !== 'success' && (
          <button onClick={resetAndClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white transition-colors z-10 p-2">✕</button>
        )}

        {step === 'scan' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
            <div className="text-center mb-6">
              <div className="bg-amber-500/10 w-fit px-4 py-1 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2 mx-auto">Instant Recharge</div>
              <h2 className="text-2xl font-black text-white">Buy 100 Tokens</h2>
              <p className="text-slate-400 text-xs mt-1">Pay exactly <span className="text-white font-bold">₹{PURCHASE_PRICE_INR}</span> to the scanner below</p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 relative group ring-8 ring-slate-800/50">
              <div className="w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=bank@upi&pn=GenAI&am=10&cu=INR" 
                  alt="Bank Scanner"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/400x400/white/black?text=PAYMENT+SCANNER";
                  }}
                />
              </div>
              <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                <div className="bg-white px-4 py-1 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-900">ACTIVE SCANNER</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount to pay</span>
                <span className="text-lg font-black text-amber-500">₹{PURCHASE_PRICE_INR}.00</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center italic">After payment, copy the Transaction ID (UTR) to verify.</p>
            </div>

            <button
              onClick={handlePaidClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              I Have Paid ₹{PURCHASE_PRICE_INR}
            </button>
            <div className="flex items-center gap-2 mt-4 text-slate-600">
               <div className="h-px flex-1 bg-slate-800"></div>
               <span className="text-[8px] font-black uppercase tracking-widest">Secure UPI Payment</span>
               <div className="h-px flex-1 bg-slate-800"></div>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="animate-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-2xl mb-4 text-blue-500">
                <Icons.Edit />
              </div>
              <h2 className="text-2xl font-bold text-white">Verify Payment</h2>
              <p className="text-slate-400 text-sm mt-1">Enter the 12-digit UTR/Ref Number from your payment app</p>
            </div>

            <div className="flex flex-col gap-2 mb-8">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction ID (UTR)</label>
               <input
                type="text"
                placeholder="UTR Number"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-center text-xl font-mono tracking-widest text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
              />
            </div>

            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying || utr.length < 8}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Checking Bank Status...</span>
                </>
              ) : (
                <span>Verify & Get Tokens</span>
              )}
            </button>
            <button onClick={() => setStep('scan')} className="w-full mt-4 text-slate-500 text-xs font-bold hover:text-white transition-colors">← Go back to Scanner</button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40 border-4 border-slate-900">
              <svg className="w-10 h-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Recharge Successful!</h2>
            <p className="text-slate-400 mb-8 px-4">Your payment of ₹{PURCHASE_PRICE_INR} was verified. {PURCHASE_TOKEN_AMOUNT} Tokens have been added to your Lion wallet.</p>
            <button
              onClick={resetAndClose}
              className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg hover:bg-amber-50 active:scale-95"
            >
              Continue to Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthForm: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onAuth({ 
        email, 
        name: mode === 'signup' ? name : 'Creator',
        tokens: FREE_MONTHLY_TOKENS,
        lastResetMonth: new Date().getMonth()
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20 mb-4 text-slate-950">
            <Icons.Sparkles />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter gradient-text uppercase">Sher Studio</h1>
          <p className="text-slate-400 text-[10px] sm:text-xs mt-2 uppercase tracking-[0.2em] font-bold">The Poor Man's Son Becomes a Lion 🔥</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.User /></div>
              <input required type="text" placeholder="Full Name" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-none" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Mail /></div>
            <input required type="email" placeholder="Email Address" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Lock /></div>
            <input required type="password" placeholder="Password" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg mt-2 flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <span>{mode === 'signin' ? 'Sign In Now' : 'Join & Get 200 Tokens'}</span>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-slate-400 text-xs font-bold hover:text-amber-500 transition-colors">
            {mode === 'signin' ? "New creator? Create an account" : "Already a Lion? Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ user: User, onLogout: () => void, onUserUpdate: (u: User) => void }> = ({ user, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('generate');
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [error, setError] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    if (user.lastResetMonth !== currentMonth) {
      onUserUpdate({ ...user, tokens: FREE_MONTHLY_TOKENS, lastResetMonth: currentMonth });
    }
  }, []);

  const filterString = useMemo(() => `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) hue-rotate(${adjustments.hue}deg) blur(${adjustments.blur}px) sepia(${adjustments.sepia}%)`, [adjustments]);

  const deductTokens = useCallback(() => {
    if (user.tokens < TOKEN_COST_PER_GEN) {
      setError("Insufficient balance!");
      setIsShopOpen(true);
      return false;
    }
    onUserUpdate({ ...user, tokens: user.tokens - TOKEN_COST_PER_GEN });
    return true;
  }, [user, onUserUpdate]);

  const applyPreset = (preset: ThumbnailPreset) => {
    setPrompt(preset.prompt);
    setActiveTab('generate');
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!deductTokens()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await geminiService.generateImage(prompt, aspectRatio);
      const newImage = { id: Date.now().toString(), url: imageUrl, prompt, timestamp: Date.now() };
      setCurrentImage(imageUrl);
      setHistory(prev => [newImage, ...prev]);
      setAdjustments(DEFAULT_ADJUSTMENTS);
    } catch (err) {
      setError("Failed to create image.");
      onUserUpdate({ ...user, tokens: user.tokens + TOKEN_COST_PER_GEN });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIEdit = async () => {
    if (!currentImage || !editPrompt.trim() || isEditing) return;
    if (!deductTokens()) return;
    setIsEditing(true);
    setError(null);
    try {
      const editedUrl = await geminiService.editImage(currentImage, editPrompt);
      const newImage = { id: Date.now().toString(), url: editedUrl, prompt: editPrompt, timestamp: Date.now() };
      setCurrentImage(editedUrl);
      setHistory(prev => [newImage, ...prev]);
      setEditPrompt('');
    } catch (err) {
      setError("AI Refinement failed.");
      onUserUpdate({ ...user, tokens: user.tokens + TOKEN_COST_PER_GEN });
    } finally {
      setIsEditing(false);
    }
  };

  const commitAdjustments = () => {
    if (!currentImage || !imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    if (!ctx) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0);
    const bakedImage = canvas.toDataURL('image/png');
    setCurrentImage(bakedImage);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setHistory(prev => [{ id: Date.now().toString(), url: bakedImage, prompt: 'Manual Edit', timestamp: Date.now() }, ...prev]);
  };

  const downloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `Sher-Thumbnail-${Date.now()}.png`;
    link.click();
  };

  const AdjustmentSlider = ({ label, name, min, max }: { label: string, name: keyof ImageAdjustments, min: number, max: number }) => (
    <div className="flex flex-col gap-1 sm:gap-2">
      <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-500">
        <span>{label}</span>
        <span className="text-amber-500">{adjustments[name]}</span>
      </div>
      <input type="range" min={min} max={max} value={adjustments[name]} onChange={(e) => setAdjustments(prev => ({ ...prev, [name]: parseInt(e.target.value) }))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-100 overflow-hidden selection:bg-amber-500/30">
      <canvas ref={canvasRef} className="hidden" />
      <PaymentModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} onPurchase={() => onUserUpdate({ ...user, tokens: user.tokens + PURCHASE_TOKEN_AMOUNT })} />
      
      <header className="flex-shrink-0 z-50 w-full border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-amber-500 p-1.5 sm:p-2 rounded-lg text-slate-950 shadow-lg shadow-amber-500/20">
            <Icons.Sparkles />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-xl font-black tracking-tighter gradient-text leading-none uppercase">Sher Studio</h1>
            <span className="text-[8px] font-bold text-slate-500 tracking-[0.3em] uppercase hidden sm:block">Poor Man's Son is a Lion 🔥</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsShopOpen(true)} 
            className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-2xl hover:border-amber-500 transition-all group shadow-inner"
          >
            <div className="text-amber-500 scale-90"><Icons.Coins /></div>
            <span className="text-xs sm:text-sm font-black">{user.tokens}</span>
            <div className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-lg group-hover:scale-105 transition-transform ml-1 shadow-sm">TOPUP</div>
          </button>
          <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900 rounded-xl border border-slate-800"><Icons.Logout /></button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <aside className={`${showControls ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 xl:w-96 flex-shrink-0 flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0f172a] h-[45vh] lg:h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 gap-6 z-40`}>
          <div className="flex p-1.5 bg-slate-950 border border-slate-800 rounded-2xl flex-shrink-0">
            {(['generate', 'ai-edit', 'adjust'] as EditorTab[]).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all capitalize tracking-widest ${
                  activeTab === tab 
                    ? tab === 'generate' ? 'bg-amber-500 text-slate-950 shadow-lg' : tab === 'ai-edit' ? 'bg-blue-600 text-white shadow-lg' : 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {activeTab === 'generate' && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Thumbnail Idea
                  </h2>
                  <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">{TOKEN_COST_PER_GEN} TOKENS</span>
                </div>
                <textarea
                  className="w-full h-24 sm:h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500/20 resize-none outline-none shadow-inner"
                  placeholder="Poor man's son becomes a lion (Hulk angry face, fire background)..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {Object.values(AspectRatio).map(ratio => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === ratio ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
                      {ratio === '9:16' ? 'SHORTS (9:16)' : ratio}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || user.tokens < TOKEN_COST_PER_GEN}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Icons.Sparkles />
                      <span>{user.tokens < TOKEN_COST_PER_GEN ? 'LOW BALANCE' : 'GENERATE LION'}</span>
                    </>
                  )}
                </button>
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-1">Viral Templates</p>
                  {THUMBNAIL_PRESETS.map(p => (
                    <button key={p.id} onClick={() => applyPreset(p)} className="text-left bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-amber-500/50 transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity">
                         <Icons.Sparkles />
                       </div>
                       <span className="text-[11px] font-black text-slate-400 group-hover:text-amber-500 transition-colors uppercase tracking-wider">{p.name}</span>
                       <p className="text-[9px] text-slate-600 mt-1 line-clamp-1">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai-edit' && (
              <div className={`flex flex-col gap-4 animate-in fade-in duration-300 ${!currentImage ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                     Magic Refine
                  </h2>
                  <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">{TOKEN_COST_PER_GEN} TOKENS</span>
                </div>
                <textarea
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 resize-none outline-none shadow-inner"
                  placeholder="Change colors, add elements, or improve details..."
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                />
                <button
                  onClick={handleAIEdit}
                  disabled={isEditing || !editPrompt.trim() || !currentImage || user.tokens < TOKEN_COST_PER_GEN}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isEditing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Icons.Edit />
                      <span>{user.tokens < TOKEN_COST_PER_GEN ? 'LOW BALANCE' : 'APPLY AI MAGIC'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className={`flex flex-col gap-4 animate-in fade-in duration-300 ${!currentImage ? 'opacity-30 pointer-events-none' : ''}`}>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Color Controls (FREE)</h2>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col gap-5 shadow-inner">
                  <AdjustmentSlider label="Brightness" name="brightness" min={0} max={200} />
                  <AdjustmentSlider label="Contrast" name="contrast" min={0} max={200} />
                  <AdjustmentSlider label="Saturation" name="saturation" min={0} max={200} />
                  <AdjustmentSlider label="Hue Rotate" name="hue" min={0} max={360} />
                </div>
                <button onClick={commitAdjustments} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/10 transition-all active:scale-95">SAVE EDITS</button>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 bg-[#020617] relative flex flex-col items-center justify-center p-4 sm:p-8 min-h-[40vh] overflow-hidden">
          {error && (
            <div className="absolute top-4 inset-x-4 max-w-lg mx-auto bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-2xl text-xs flex items-center justify-between z-[60] animate-in slide-in-from-top-4 shadow-2xl backdrop-blur-md">
              <span className="font-black tracking-wider uppercase">{error}</span>
              <button onClick={() => setIsShopOpen(true)} className="bg-red-500 text-white px-4 py-1.5 rounded-xl font-black text-[10px] hover:bg-red-600">GET TOKENS</button>
            </div>
          )}

          <div className="w-full h-full flex items-center justify-center relative">
            {currentImage ? (
              <div className="relative group max-w-full max-h-full flex items-center justify-center">
                <img 
                  ref={imageRef}
                  src={currentImage} 
                  alt="Editor View" 
                  style={{ filter: filterString }}
                  className="max-w-full max-h-[75vh] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 object-contain transition-all duration-300"
                />
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 opacity-100 sm:opacity-0 transition-all transform translate-y-4 group-hover:translate-y-0">
                  <button onClick={downloadImage} className="bg-white text-slate-950 px-8 py-3.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-3 hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all">
                    <Icons.Download />
                    EXPORT LION
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-1000">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-700 shadow-2xl shadow-black border border-slate-800 relative group overflow-hidden">
                   <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-all"></div>
                   <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                     <Icons.Sparkles />
                   </div>
                </div>
                <div>
                  <p className="text-slate-200 font-black text-xl sm:text-2xl tracking-tighter uppercase italic">Create Viral Visuals</p>
                  <p className="text-slate-600 text-[10px] sm:text-xs uppercase tracking-[0.4em] font-black mt-3">Studio Power x Gemini 2.5</p>
                  <div className="mt-8 flex gap-2 justify-center">
                    <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-[10px] font-black text-slate-500 tracking-widest">{user.tokens} TOKENS READY</div>
                  </div>
                </div>
              </div>
            )}

            {(isGenerating || isEditing) && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl z-[70] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-amber-500/20">
                    <Icons.Sparkles />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-amber-500 font-black text-sm uppercase tracking-[0.3em] animate-pulse">Lion is loading...</p>
                  <p className="text-slate-500 text-[10px] mt-2 font-bold">Painting your high-CTR thumbnail</p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowControls(!showControls)}
            className="lg:hidden absolute bottom-6 right-6 bg-slate-800 text-white p-4 rounded-[1.5rem] shadow-2xl border border-slate-700 z-50 active:scale-90 transition-transform shadow-amber-500/10"
          >
            {showControls ? '✕ CLOSE' : <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><Icons.Edit /> TOOLS</div>}
          </button>
        </section>

        <aside className="hidden xl:flex w-80 flex-shrink-0 flex-col border-l border-slate-800 bg-[#0f172a] p-6 h-full overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Icons.History />
              Past Projects
            </h3>
            <button onClick={() => setHistory([])} className="text-slate-700 hover:text-red-400 transition-colors p-2 bg-slate-900 rounded-xl"><Icons.Trash /></button>
          </div>
          <div className="flex flex-col gap-4">
            {history.length === 0 && (
              <div className="py-20 text-center px-4">
                <div className="text-slate-800 mb-4 flex justify-center"><Icons.History /></div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-loose">No history yet. Start creating to see your Lion collection here.</p>
              </div>
            )}
            {history.map((img) => (
              <div 
                key={img.id}
                onClick={() => { setCurrentImage(img.url); setAdjustments(DEFAULT_ADJUSTMENTS); }}
                className={`relative aspect-[16/9] cursor-pointer rounded-2xl overflow-hidden border-2 transition-all group ${
                  currentImage === img.url ? 'border-amber-500 shadow-2xl shadow-amber-500/10 scale-[1.02]' : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="History Item" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                   <span className="text-[8px] font-bold text-white uppercase truncate">{img.prompt}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
      
      {!showControls && history.length > 0 && (
        <div className="lg:hidden bg-slate-950/80 backdrop-blur-md border-t border-slate-800 p-3 overflow-x-auto whitespace-nowrap flex gap-4 animate-in slide-in-from-bottom-full duration-500 z-30">
          {history.map((img) => (
            <div 
              key={img.id}
              onClick={() => setCurrentImage(img.url)}
              className={`w-28 aspect-[16/9] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                currentImage === img.url ? 'border-amber-500 shadow-lg' : 'border-slate-800 active:scale-95'
              }`}
            >
              <img src={img.url} className="w-full h-full object-cover" alt="History" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('thumgen_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleAuth = (userData: User) => {
    setUser(userData);
    localStorage.setItem('thumgen_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('thumgen_user');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('thumgen_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
};

export default App;
