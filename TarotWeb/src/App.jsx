import { useState, useEffect } from 'react';
import Background from './components/layout/Background';
import DeckComponent from './components/tarot/DeckComponent';
import SpreadArea from './components/tarot/SpreadArea';
import Controls from './components/tarot/Controls';
import QuestionInput from './components/tarot/QuestionInput';
import { postReading, getCards } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './contexts/SoundContext';
import MuteButton from './components/MuteButton';

function App() {
  const [gameState, setGameState] = useState('intro'); // intro, shuffling, fanning, picking, analyzing, revealing
  const [selectedCards, setSelectedCards] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [readingResult, setReadingResult] = useState(null);
  const [allCards, setAllCards] = useState([]); // Raw cards from DB
  const [deck, setDeck] = useState([]); // Shuffled deck to display

  useEffect(() => {
    getCards().then(data => {
      setAllCards(data);
      // Initial set (ordered)
      setDeck(data);
    }).catch(err => console.error("Failed to load cards", err));
  }, []);

  // Audio effects (placeholders)
  const { playBgm, playSound, stopSound } = useSound();

  const playShuffleSound = () => {
    // Reset sound if needed (optional since play() usually handles new instances or restart)
    stopSound('shuffle');
    playSound('shuffle');
  };

  const handleStart = (question) => {
    setUserQuestion(question);
    playBgm();
    handleShuffle();
  };

  const handleShuffle = () => {
    setGameState('shuffling');
    playShuffleSound();
    setSelectedCards([]);
    setReadingResult(null);

    // Shuffle the deck
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setSelectedCards([]); // Ensure clear

    // Simulate shuffle duration
    setTimeout(() => {
      stopSound('shuffle'); // Stop shuffling sound
      setGameState('picking');
    }, 3000);
  };

  const handleCardPick = async (cardId) => {
    if (selectedCards.length >= 3) return;

    // Prevent picking fallback cards (which have string IDs like 'deck-card-0')
    if (typeof cardId === 'string' && cardId.startsWith('deck-card')) {
      alert("Không thể kết nối đến server để lấy dữ liệu bài. Vui lòng kiểm tra kết nối mạng hoặc server.");
      return;
    }

    // Temporary placeholder until API returns real data
    const tempCard = {
      id: cardId,
      name: 'Unknown',
      image: null,
      isRevealed: false
    };

    const newSelection = [...selectedCards, tempCard];
    setSelectedCards(newSelection);

    if (newSelection.length === 3) {
      setGameState('analyzing');
      try {
        const response = await postReading(userQuestion, newSelection.map(c => c.id));
        setReadingResult(response);

        // Update cards with real data from response
        const updatedCards = newSelection.map((card, index) => {
          // Response cards should match position order logic in backend
          // But backend returns 'Cards' list. We match by ID or index. 
          // Backend logic: orderedCards matches request.SelectedCardIds order.
          const apiCard = response.cards[index];
          return {
            ...card,
            name: apiCard.name,
            image: apiCard.imageUrl,
            desc: apiCard.position // or other info if needed
          };
        });
        setSelectedCards(updatedCards);

        setGameState('revealing');
      } catch (error) {
        console.error("Reading failed", error);
        alert("Không thể kết nối với các vì sao. Vui lòng thử lại.");
        setGameState('picking'); // Go back to picking state or reset?
        setSelectedCards([]);
      }
    }
  };

  const handleReveal = (cardId) => {
    if (gameState !== 'revealing') return;

    // Toggle reveal state for the specific card
    setSelectedCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, isRevealed: true } : card
    ));
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-y-auto overflow-x-hidden">
      <Background />
      <MuteButton />

      <main className="z-10 w-full max-w-6xl flex flex-col items-center gap-4 md:gap-8 min-h-[90vh]">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-mystic-gold to-orange-400 text-center drop-shadow-lg animate-pulse-slow mt-4 md:mt-0">
          Tarot Thần Bí
        </h1>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-12 w-full relative">

          {/* Intro / Question Input */}
          <AnimatePresence>
            {gameState === 'intro' && (
              <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60 backdrop-blur-sm rounded-xl p-4">
                <QuestionInput onStart={handleStart} />
              </div>
            )}
          </AnimatePresence>

          {/* Analyzing Spinner */}
          <AnimatePresence>
            {gameState === 'analyzing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-md rounded-xl"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 animate-pulse shadow-[0_0_50px_rgba(168,85,247,0.6)] mb-4"></div>
                <p className="text-mystic-gold font-serif text-xl animate-pulse">Đang Hỏi Các Vì Sao...</p>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Spread Area - Flexible height */}
          <div className="w-full h-auto flex flex-col items-center justify-center z-10 min-h-[300px] md:min-h-[400px]">
            <SpreadArea
              cards={selectedCards}
              isRevealed={gameState === 'revealing'}
              onCardReveal={handleReveal}
              readingResult={readingResult}
            />
          </div>

          {/* Deck Area - Compact on mobile */}
          <div className="h-40 md:h-60 w-full flex items-center justify-center relative z-20">
            {gameState !== 'revealing' && gameState !== 'intro' && gameState !== 'analyzing' && (
              <DeckComponent
                gameState={gameState}
                onCardPick={handleCardPick}
                cards={deck}
                selectedCards={selectedCards}
              />
            )}
          </div>

          {/* Controls - e.g. Reset */}
          <div className="z-30 pb-4">
            {gameState === 'revealing' && (
              <button
                onClick={() => setGameState('intro')}
                className="text-mystic-gold hover:text-white transition-colors font-serif border-b border-mystic-gold/50 text-sm md:text-base"
              >
                Bắt Đầu Trải Bài Mới
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
