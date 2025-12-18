import React, { useState, useEffect, useCallback } from 'react';
import { CameraApp, MessagesApp, MusicApp, PhotosApp, SettingsApp } from './components/Apps';
import { AppId, Photo } from './types';
import { Wifi, Battery, Signal, Aperture, Settings as SettingsIcon, Image, MessageSquare, Music as MusicIcon, Mic } from 'lucide-react';
import { generateSiriResponse } from './services/geminiService';

const App = () => {
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [isSiriOpen, setIsSiriOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [siriText, setSiriText] = useState("");
  const [siriResponse, setSiriResponse] = useState("");
  const [isSiriThinking, setIsSiriThinking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openApp = (app: AppId) => {
    setActiveApp(app);
  };

  const closeApp = () => {
    setActiveApp(null);
  };

  const handleSiriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siriText.trim()) return;
    
    setIsSiriThinking(true);
    setSiriResponse("");
    const response = await generateSiriResponse(siriText);
    setSiriResponse(response);
    setIsSiriThinking(false);
    setSiriText("");
  };

  const addPhoto = useCallback((url: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url,
      timestamp: Date.now()
    };
    setPhotos(prev => [newPhoto, ...prev]);
  }, []);

  // --- Components for System UI ---

  const StatusBar = () => (
    <div className="absolute top-0 w-full h-12 px-6 flex justify-between items-center text-white z-50 pointer-events-none select-none mix-blend-difference">
      <div className="font-semibold text-sm tracking-wide">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\s[AP]M/, '')}
      </div>
      <div className="flex items-center gap-2">
        <Signal size={16} fill="currentColor" />
        <Wifi size={16} />
        <Battery size={20} />
      </div>
    </div>
  );

  const HomeBar = () => (
    <div className="absolute bottom-1 w-full flex justify-center z-50 pointer-events-none">
       {/* If app is open, clickable area to close */}
       <div 
         className="w-32 h-1.5 bg-white/50 backdrop-blur-md rounded-full mb-2 pointer-events-auto cursor-pointer hover:bg-white/80 transition-colors"
         onClick={closeApp}
       />
    </div>
  );

  const AppIcon = ({ id, icon, color, label, onClick }: any) => (
    <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={onClick}>
      <div className={`w-[60px] h-[60px] ${color} rounded-[14px] flex items-center justify-center text-white shadow-lg transition-transform duration-200 active:scale-90 group-hover:brightness-110 relative overflow-hidden`}>
         {/* Gloss effect */}
         <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
         {icon}
      </div>
      <span className="text-[11px] font-medium text-white drop-shadow-md">{label}</span>
    </div>
  );

  // --- Render ---

  return (
    <div className="w-full h-screen bg-zinc-900 flex items-center justify-center overflow-hidden font-sans">
      {/* Phone Bezel/Frame */}
      <div className="relative w-full h-full md:w-[390px] md:h-[844px] md:rounded-[50px] bg-black overflow-hidden shadow-[0_0_0_12px_#1a1a1a,0_0_0_13px_#333,0_20px_50px_-10px_rgba(0,0,0,0.5)] border-4 border-gray-800">
        
        {/* Dynamic Island (Simplistic) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-[60] flex justify-center items-center">
            {/* Camera lens dot */}
        </div>

        {/* Wallpaper */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1621360841013-c768371e93cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
            transform: activeApp ? 'scale(0.95) blur(2px)' : 'scale(1)'
          }}
        />

        <StatusBar />

        {/* Home Screen Grid */}
        <div className={`absolute inset-0 pt-16 px-6 transition-all duration-500 ease-in-out ${activeApp ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="grid grid-cols-4 gap-x-4 gap-y-8">
            <AppIcon id={AppId.SETTINGS} label="Settings" color="bg-gray-500" icon={<SettingsIcon size={32} />} onClick={() => openApp(AppId.SETTINGS)} />
            <AppIcon id={AppId.PHOTOS} label="Photos" color="bg-white" icon={<div className="relative w-full h-full flex items-center justify-center"><div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-pink-200 to-yellow-100 opacity-50"/><Image className="text-pink-500 relative z-10" size={32} /></div>} onClick={() => openApp(AppId.PHOTOS)} />
            <AppIcon id={AppId.CAMERA} label="Camera" color="bg-gray-200" icon={<Aperture size={32} className="text-gray-800" />} onClick={() => openApp(AppId.CAMERA)} />
             {/* Filler Apps for grid look */}
             <AppIcon label="Weather" color="bg-blue-400" icon={<div className="text-yellow-300">☀</div>} onClick={() => {}} />
             <AppIcon label="Maps" color="bg-green-100" icon={<div className="w-8 h-8 border-2 border-orange-400 rounded-full flex items-center justify-center text-blue-500">📍</div>} onClick={() => {}} />
             <AppIcon label="Clock" color="bg-black border border-white/20" icon={<div className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white text-[10px]">12</div>} onClick={() => {}} />
          </div>
        </div>

        {/* Dock */}
        <div className={`absolute bottom-4 left-4 right-4 h-24 bg-white/20 backdrop-blur-2xl rounded-[32px] flex items-center justify-around px-2 transition-transform duration-500 ${activeApp ? 'translate-y-32' : 'translate-y-0'}`}>
           <AppIcon id={AppId.MESSAGES} label="" color="bg-green-500" icon={<MessageSquare size={30} fill="white" />} onClick={() => openApp(AppId.MESSAGES)} />
           <AppIcon id={AppId.MUSIC} label="" color="bg-red-500" icon={<MusicIcon size={30} fill="white" />} onClick={() => openApp(AppId.MUSIC)} />
           <div className="w-[60px] h-[60px] bg-gradient-to-br from-blue-400 to-purple-500 rounded-[14px] flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-transform" onClick={() => setIsSiriOpen(true)}>
             <div className="text-white font-bold text-xs flex flex-col items-center"><div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-0.5">Siri</div></div>
           </div>
           <AppIcon label="" color="bg-blue-500" icon={<div className="text-white text-2xl">A</div>} onClick={() => {}} />
        </div>

        {/* Active App View */}
        <div className={`absolute inset-0 bg-black transition-all duration-500 ${activeApp ? 'translate-y-0 rounded-none' : 'translate-y-full rounded-[50px]'} z-40 overflow-hidden`}>
          {activeApp === AppId.CAMERA && <CameraApp onCapture={addPhoto} isOpen={activeApp === AppId.CAMERA} />}
          {activeApp === AppId.PHOTOS && <PhotosApp photos={photos} />}
          {activeApp === AppId.MESSAGES && <MessagesApp />}
          {activeApp === AppId.MUSIC && <MusicApp />}
          {activeApp === AppId.SETTINGS && <SettingsApp />}
        </div>
        
        <HomeBar />

        {/* Siri Overlay */}
        {isSiriOpen && (
          <div className="absolute inset-0 z-[70] flex flex-col justify-end pointer-events-auto">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSiriOpen(false)} />
            
            <div className="relative w-full p-6 flex flex-col items-center">
              {/* Response Area */}
              {(siriResponse || isSiriThinking) && (
                 <div className="mb-8 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white max-w-[90%] text-center shadow-2xl">
                    {isSiriThinking ? "Thinking..." : siriResponse}
                 </div>
              )}

              {/* Glowing Orb Animation */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl animate-pulse mb-4 opacity-80" />
              
              {/* Input */}
              <form onSubmit={handleSiriSubmit} className="w-full relative z-10 flex gap-2">
                <input 
                  type="text" 
                  value={siriText}
                  onChange={(e) => setSiriText(e.target.value)}
                  placeholder="Ask Siri..."
                  className="flex-1 bg-white/20 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:bg-white/30 transition-colors"
                  autoFocus
                />
                {siriText && (
                   <button type="submit" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      ↑
                   </button>
                )}
              </form>
              <div className="h-4"></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;