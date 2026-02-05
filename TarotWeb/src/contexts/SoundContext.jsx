import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Howl, Howler } from 'howler';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const bgmRef = useRef(null);

    // Sound instances map
    const soundsRef = useRef({});

    useEffect(() => {
        // Initialize SFX
        soundsRef.current = {
            shuffle: new Howl({
                src: ['/assets/sounds/shuffle.mp3'],
                volume: 0.6,
                loop: true,
                onload: () => console.log('SFX Shuffle Loaded'),
                onloaderror: (id, err) => console.error('Shuffle load error', err)
            }),
            slide: new Howl({
                src: ['/assets/sounds/flip.mp3'], // Use flip sound as fallback for slide
                volume: 0.6,
                onload: () => console.log('SFX Slide Loaded'),
                onloaderror: (id, err) => console.error('Slide load error', err)
            }),
            flip: new Howl({
                src: ['/assets/sounds/flip.mp3'],
                volume: 0.6,
                onload: () => console.log('SFX Flip Loaded'),
                onloaderror: (id, err) => console.error('Flip load error', err)
            }),
            reveal: new Howl({
                src: ['/assets/sounds/reveal.mp3'],
                volume: 0.2, // Lower volume for reading result
                onload: () => console.log('SFX Reveal Loaded'),
                onloaderror: (id, err) => console.error('Reveal load error', err)
            }),
        };

        // Initialize BGM
        bgmRef.current = new Howl({
            src: ['/assets/sounds/bgm.mp3'],
            html5: true, // Force HTML5 Audio for large files like BGM
            loop: true,
            volume: 0.3,
            autoplay: false,
            onloaderror: (id, err) => console.error('BGM load error', err),
            onplay: () => console.log('BGM Playing')
        });

        return () => {
            if (bgmRef.current) bgmRef.current.unload();
            Object.values(soundsRef.current).forEach(sound => sound.unload());
        };
    }, []);

    useEffect(() => {
        // Handle Global Mute
        const mainVolume = isMuted ? 0 : 1;
        Howler.mute(isMuted);
    }, [isMuted]);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const playBgm = () => {
        if (bgmRef.current && !bgmRef.current.playing()) {
            bgmRef.current.fade(0, 0.3, 1000); // fade in over 1s
            bgmRef.current.play();
        }
    };

    const playSound = (soundName) => {
        const sound = soundsRef.current[soundName];
        if (sound) {
            console.log(`Playing sound: ${soundName}`);
            sound.play();
        } else {
            console.warn(`Sound "${soundName}" not found.`);
        }
    };

    const stopSound = (soundName) => {
        const sound = soundsRef.current[soundName];
        if (sound) {
            sound.stop();
        }
    };

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playBgm, playSound, stopSound }}>
            {children}
        </SoundContext.Provider>
    );
};
