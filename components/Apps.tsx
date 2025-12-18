import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, Mic, Send, ChevronLeft, Play, Pause, SkipForward, SkipBack, Battery, Wifi, Settings as SettingsIcon, Image as ImageIcon, MessageSquare, Music as MusicIcon, Aperture, X } from 'lucide-react';
import { Photo, Message, ChatContact } from '../types';
import { generateMessageReply } from '../services/geminiService';

// --- Camera App ---
interface CameraAppProps {
  onCapture: (url: string) => void;
  isOpen: boolean;
}

export const CameraApp: React.FC<CameraAppProps> = ({ onCapture, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const constraints = { video: { facingMode: "environment", width: { ideal: 1080 }, height: { ideal: 1920 } } };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        // Simulate "focusing" delay for realism
        setTimeout(() => setLoading(false), 800);
      } catch (err) {
        console.error("Camera access denied:", err);
        setLoading(false);
      }
    };

    if (isOpen) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const takePhoto = () => {
    if (!videoRef.current || !stream) return;
    
    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/jpeg');
      onCapture(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-black relative flex flex-col justify-between overflow-hidden">
      {/* Viewfinder */}
      <div className="flex-1 relative rounded-3xl overflow-hidden mt-12 mx-2 mb-24 bg-zinc-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Flash Overlay */}
        <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 ${flash ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Fake UI Overlays */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white text-xs">HDR</div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 w-full h-32 bg-black/80 backdrop-blur-xl flex items-center justify-around pb-6 pt-2 z-20">
        <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden border border-white/20">
           {/* Last photo placeholder could go here */}
        </div>
        <button 
          onClick={takePhoto}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 bg-white rounded-full" />
        </button>
        <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </button>
      </div>
    </div>
  );
};

// --- Photos App ---
export const PhotosApp: React.FC<{ photos: Photo[] }> = ({ photos }) => {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="pt-12 pb-4 px-6 border-b border-gray-200 bg-white/90 backdrop-blur-xl sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-black tracking-tight">Photos</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-1 grid grid-cols-3 gap-0.5 content-start">
        {photos.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-gray-400">
            <p>No photos yet</p>
            <p className="text-sm">Take some with the Camera app</p>
          </div>
        ) : (
          photos.map((photo) => (
            <div key={photo.id} className="aspect-square bg-gray-100 relative overflow-hidden">
              <img src={photo.url} alt="captured" className="w-full h-full object-cover" />
            </div>
          ))
        )}
        {/* Fillers for aesthetic */}
        {[1,2,3,4,5].map(i => (
            <div key={i} className="aspect-square bg-gray-100 relative overflow-hidden group">
                <img src={`https://picsum.photos/300/300?random=${i}`} className="w-full h-full object-cover opacity-80" alt="filler" />
            </div>
        ))}
      </div>
      <div className="h-16 border-t border-gray-200 flex justify-around items-center bg-white/90 backdrop-blur">
          <span className="text-blue-500 font-semibold text-sm">Library</span>
          <span className="text-gray-400 text-sm">For You</span>
          <span className="text-gray-400 text-sm">Albums</span>
          <span className="text-gray-400 text-sm">Search</span>
      </div>
    </div>
  );
};

// --- Messages App ---
export const MessagesApp: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([
    {
      id: '1',
      name: 'Kate Bell',
      avatar: 'KB',
      lastMessage: 'See you tomorrow! 👋',
      messages: [{ id: 'm1', text: 'Hey, are we still on for lunch?', isSender: false, timestamp: new Date() }]
    },
    {
      id: '2',
      name: 'John Appleseed',
      avatar: 'JA',
      lastMessage: 'The photos look great.',
      messages: [{ id: 'm2', text: 'Can you send me the pics from the trip?', isSender: false, timestamp: new Date() }]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, contacts]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isSender: true,
      timestamp: new Date()
    };

    setContacts(prev => prev.map(c => 
      c.id === activeChat 
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: inputText }
        : c
    ));
    setInputText('');
    setIsTyping(true);

    // AI Reply
    const contact = contacts.find(c => c.id === activeChat);
    const history = contact?.messages.map(m => ({ role: m.isSender ? 'user' : 'model', content: m.text })) || [];
    history.push({ role: 'user', content: newMessage.text });

    const reply = await generateMessageReply(history, contact?.name || "Friend");
    
    setTimeout(() => {
        setContacts(prev => prev.map(c => 
            c.id === activeChat 
              ? { ...c, messages: [...c.messages, { id: Date.now().toString(), text: reply, isSender: false, timestamp: new Date() }], lastMessage: reply }
              : c
          ));
        setIsTyping(false);
    }, 1500);
  };

  if (activeChat) {
    const chat = contacts.find(c => c.id === activeChat);
    return (
      <div className="h-full w-full bg-white flex flex-col">
        {/* Chat Header */}
        <div className="pt-12 pb-2 px-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setActiveChat(null)} className="flex items-center text-blue-500">
            <ChevronLeft size={28} />
            <span className="text-lg -ml-1">Filters</span>
          </button>
          <div className="flex flex-col items-center">
             <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs mb-0.5">{chat?.avatar}</div>
             <span className="text-xs text-gray-900 font-medium">{chat?.name}</span>
          </div>
          <div className="w-16"></div> {/* Spacer */}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {chat?.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-[17px] leading-snug ${
                msg.isSender 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-gray-200 text-black rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
           {isTyping && (
             <div className="flex justify-start">
               <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm flex space-x-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 mb-safe">
            <button className="text-gray-400 p-2"><CameraIcon size={24} /></button>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="iMessage"
                    className="w-full border border-gray-300 rounded-full py-1.5 px-4 pr-8 focus:outline-none focus:border-blue-500 transition-colors"
                />
                {inputText.length > 0 && (
                     <button onClick={handleSend} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full p-1 w-7 h-7 flex items-center justify-center">
                         <span className="font-bold text-xs">↑</span>
                     </button>
                )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="pt-14 pb-2 px-6 flex justify-between items-end bg-white/95 backdrop-blur z-10">
        <button className="text-blue-500 text-lg">Edit</button>
        <h1 className="text-3xl font-bold text-black">Messages</h1>
        <button className="text-blue-500"><MessageSquare size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
         {contacts.map(contact => (
           <div key={contact.id} onClick={() => setActiveChat(contact.id)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-medium text-lg">
                  {contact.avatar}
              </div>
              <div className="flex-1 border-b border-gray-100 pb-3">
                  <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-black">{contact.name}</h3>
                      <span className="text-gray-400 text-xs">Yesterday</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-tight mt-0.5">{contact.lastMessage}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// --- Music App ---
export const MusicApp: React.FC = () => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(30);

    return (
        <div className="h-full w-full bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
            <div className="pt-4 flex justify-center">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full aspect-square bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl shadow-2xl mb-12 flex items-center justify-center relative overflow-hidden">
                    <MusicIcon size={80} className="text-white/50" />
                    <div className={`absolute inset-0 bg-white/10 ${playing ? 'animate-pulse' : ''}`} />
                </div>
                
                <div className="w-full mb-8">
                    <h2 className="text-2xl font-bold mb-1">Liquid Dreams</h2>
                    <p className="text-gray-400 text-lg">Glass Animals</p>
                </div>

                <div className="w-full mb-8">
                    <div className="w-full h-1 bg-gray-800 rounded-full mb-2">
                        <div className="h-full bg-white rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>1:12</span>
                        <span>-2:45</span>
                    </div>
                </div>

                <div className="w-full flex items-center justify-between px-4">
                    <SkipBack size={32} className="fill-current" />
                    <button onClick={() => setPlaying(!playing)} className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black active:scale-95 transition-transform">
                        {playing ? <Pause size={36} fill="black" /> : <Play size={36} fill="black" className="ml-1" />}
                    </button>
                    <SkipForward size={32} className="fill-current" />
                </div>
            </div>
            {/* Bottom Tab Bar for Music (Fake) */}
             <div className="h-20 bg-gray-900/90 backdrop-blur border-t border-white/10 flex justify-around items-center pb-4 text-xs text-gray-500">
                 <div className="flex flex-col items-center text-white"><Play size={20} className="mb-1 fill-current" /> Listen Now</div>
                 <div className="flex flex-col items-center"><div className="w-5 h-5 border-2 border-current rounded mb-1"></div>Browse</div>
                 <div className="flex flex-col items-center"><div className="w-5 h-5 bg-current rounded mb-1 opacity-50"></div>Radio</div>
                 <div className="flex flex-col items-center"><div className="w-5 h-5 bg-current rounded mb-1 opacity-50"></div>Library</div>
                 <div className="flex flex-col items-center"><div className="w-5 h-5 bg-current rounded mb-1 opacity-50"></div>Search</div>
             </div>
        </div>
    );
}

// --- Settings App ---
export const SettingsApp: React.FC = () => {
    const SettingItem = ({ icon, color, label, value }: any) => (
        <div className="flex items-center justify-between px-4 py-3 bg-white active:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-md ${color} flex items-center justify-center text-white`}>
                    {icon}
                </div>
                <span className="text-black text-[17px]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-gray-400 text-[17px]">{value}</span>}
                <ChevronLeft size={20} className="text-gray-300 rotate-180" />
            </div>
        </div>
    );

    return (
        <div className="h-full w-full bg-gray-100 overflow-y-auto">
            <div className="pt-12 pb-4 px-4 bg-gray-100 sticky top-0 z-10">
                <h1 className="text-3xl font-bold text-black">Settings</h1>
            </div>
            
            <div className="mx-4 mb-6 bg-white rounded-xl overflow-hidden flex items-center p-4 gap-4">
                 <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white">#</div>
                 <div>
                     <h2 className="text-xl font-medium">User</h2>
                     <p className="text-sm text-gray-500">Apple ID, iCloud, Media & Purchases</p>
                 </div>
            </div>

            <div className="mx-4 mb-6 bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
                <SettingItem icon={<div className="w-4 h-4 rounded border-2 border-white"></div>} color="bg-blue-500" label="Airplane Mode" />
                <SettingItem icon={<Wifi size={16} />} color="bg-blue-500" label="Wi-Fi" value="GlassNet" />
                <SettingItem icon={<div className="font-bold text-xs">B</div>} color="bg-blue-500" label="Bluetooth" value="On" />
                <SettingItem icon={<div className="w-4 h-4 bg-white rounded-full border-4 border-green-500"></div>} color="bg-green-500" label="Cellular" />
            </div>

            <div className="mx-4 mb-6 bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
                <SettingItem icon={<SettingsIcon size={16} />} color="bg-gray-500" label="General" />
                <SettingItem icon={<div className="w-full h-full bg-gray-300"></div>} color="bg-gray-500" label="Control Center" />
                <SettingItem icon={<div className="font-bold text-xs">AA</div>} color="bg-blue-600" label="Display & Brightness" />
            </div>
        </div>
    );
}