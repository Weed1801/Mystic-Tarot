import { useState } from 'react';
import { motion } from 'framer-motion';

const QuestionInput = ({ onStart }) => {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim()) {
            onStart(question);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto z-50"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-serif text-mystic-gold text-center mb-2">Ask the Arcana</h2>
                <p className="text-gray-300 text-center text-sm mb-4">Focus deeply on a question, then let the cards guide you.</p>

                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What does the future hold for me?"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mystic-gold/50 focus:ring-1 focus:ring-mystic-gold/50 transition-all font-serif"
                    autoFocus
                />

                <button
                    type="submit"
                    disabled={!question.trim()}
                    className="mt-2 w-full bg-gradient-to-r from-mystic-gold/80 to-purple-600/80 hover:from-mystic-gold hover:to-purple-600 text-white font-serif font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-mystic-gold/20"
                >
                    Begin Ritual
                </button>
            </form>
        </motion.div>
    );
};

export default QuestionInput;
