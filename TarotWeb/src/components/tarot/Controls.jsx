import Button from '../ui/Button';
import { Shuffle, Sparkles, Hand } from 'lucide-react';

const Controls = ({ onShuffle, onStartReading, isShuffling, gameState }) => {
    if (gameState === 'picking') {
        return (
            <div className="animate-pulse text-mystic-gold text-xl font-serif tracking-widest flex items-center gap-2">
                <Hand className="w-6 h-6" />
                Hãy chọn 3 lá bài...
            </div>
        );
    }

    if (gameState === 'revealing') {
        return (
            <div className="text-white/60 text-sm font-serif italic">
                Nhấn vào bài để xem kết quả
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 mt-8">
            <Button
                variant="secondary"
                onClick={onShuffle}
                disabled={gameState !== 'idle' && gameState !== 'revealing'}
                className="w-full md:w-auto hover:scale-105 transition-transform"
            >
                <Shuffle className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
                {gameState === 'idle' ? 'Tráo Bài & Bắt Đầu' : 'Tráo Bài Lại'}
            </Button>
        </div>
    );
};

export default Controls;
