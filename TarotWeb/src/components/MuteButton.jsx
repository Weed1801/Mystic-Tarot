import React from 'react';
import { useSound } from '../contexts/SoundContext';
import { Volume2, VolumeX } from 'lucide-react';

const MuteButton = () => {
    const { isMuted, toggleMute } = useSound();

    return (
        <button
            onClick={toggleMute}
            className="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all border border-white/10"
            title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
        >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
    );
};

export default MuteButton;
