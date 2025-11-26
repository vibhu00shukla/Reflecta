import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, Calendar, Brain, Lightbulb, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const JournalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [journal, setJournal] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const journalRes = await axios.get(`http://localhost:3000/journals/${id}`);
                setJournal(journalRes.data.journal);

                try {
                    const analysisRes = await axios.get(`http://localhost:3000/cbt/journal/${id}`);
                    setAnalysis(analysisRes.data.analysis);
                } catch (err) {
                    console.log("No analysis found or error fetching it", err);
                }

            } catch (error) {
                console.error("Failed to fetch journal details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this journal?")) {
            try {
                await axios.delete(`http://localhost:3000/journals/${id}`);
                navigate('/');
            } catch (error) {
                console.error("Failed to delete journal", error);
                alert("Failed to delete journal");
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!journal) return <div className="text-center py-20 text-gray-500">Journal not found</div>;

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen pb-12">
            <nav className="glass sticky top-0 z-10 mb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors flex items-center font-medium">
                            <div className="bg-white/50 p-1.5 rounded-full mr-2 hover:bg-white transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </div>
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete Journal"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Journal Content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="glass-card rounded-2xl overflow-hidden"
                >
                    <div className="px-6 py-6 border-b border-gray-100/50 flex justify-between items-center bg-white/40">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                            Journal Entry
                        </h3>
                        <div className="flex items-center text-sm font-medium text-gray-500 bg-white/60 px-3 py-1 rounded-full">
                            <Calendar className="h-4 w-4 mr-1.5 text-primary-500" />
                            {new Date(journal.createdAt).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                    <div className="px-8 py-8">
                        <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed font-serif">
                            {journal.entryText}
                        </p>
                        {journal.moodScore && (
                            <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                                Mood Score: {journal.moodScore}/10
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* AI Analysis */}
                {analysis ? (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-6"
                    >
                        <div className="flex items-center space-x-2 mb-4">
                            <Brain className="h-6 w-6 text-primary-600" />
                            <h2 className="text-2xl font-bold text-gray-900">AI Analysis & Insights</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Emotions */}
                            {analysis.emotions && analysis.emotions.length > 0 && (
                                <motion.div variants={fadeInUp} className="glass-card rounded-xl p-6">
                                    <h4 className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                        <Activity className="h-4 w-4 mr-2 text-blue-500" />
                                        Detected Emotions
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.emotions.map((emotion, idx) => (
                                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                                                {typeof emotion === 'string' ? emotion : emotion.name}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Distortions */}
                            {analysis.distortions && analysis.distortions.length > 0 && (
                                <motion.div variants={fadeInUp} className="glass-card rounded-xl p-6">
                                    <h4 className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                                        Cognitive Distortions
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysis.distortions.map((distortion, idx) => (
                                            <li key={idx} className="flex items-start text-gray-700 bg-orange-50/50 p-2 rounded-lg">
                                                <span className="h-1.5 w-1.5 mt-2 rounded-full bg-orange-400 mr-2 flex-shrink-0"></span>
                                                <span className="text-sm font-medium">
                                                    {distortion && (typeof distortion === 'string' ? distortion : (distortion.distortionType || distortion.type))}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </div>

                        {/* Negative Thoughts */}
                        {analysis.negativeThoughts && analysis.negativeThoughts.length > 0 && (
                            <motion.div variants={fadeInUp} className="glass-card rounded-xl p-6 border-l-4 border-l-red-400">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Negative Thoughts Identified</h4>
                                <ul className="space-y-3">
                                    {analysis.negativeThoughts.map((thought, idx) => (
                                        <li key={idx} className="text-gray-700 bg-white/50 p-3 rounded-lg border border-gray-100">
                                            "{thought && (typeof thought === 'string' ? thought : thought.text)}"
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Reframes */}
                        {analysis.reframes && analysis.reframes.length > 0 && (
                            <motion.div variants={fadeInUp} className="glass-card rounded-xl p-6 border-l-4 border-l-primary-500 bg-gradient-to-br from-white to-primary-50/30">
                                <h4 className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
                                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                                    Suggested Reframes
                                </h4>
                                <div className="space-y-6">
                                    {analysis.reframes.map((reframe, idx) => (
                                        <div key={idx} className="relative bg-white p-5 rounded-xl shadow-sm border border-primary-100">
                                            <div className="absolute -left-3 top-5 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                THOUGHT
                                            </div>
                                            <p className="text-gray-600 mb-4 pl-16 text-sm italic">
                                                "{reframe.originalThought}"
                                            </p>

                                            <div className="border-t border-gray-100 my-3"></div>

                                            <div className="absolute -left-3 bottom-5 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                REFRAME
                                            </div>
                                            <p className="text-gray-900 pl-16 font-medium text-base">
                                                "{reframe.rationalResponse}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card border-2 border-dashed border-gray-300 rounded-xl p-12 text-center"
                    >
                        <Brain className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
                        <span className="mt-4 block text-lg font-medium text-gray-900">
                            Analyzing your thoughts...
                        </span>
                        <p className="mt-2 text-gray-500">Our AI is looking for patterns and helpful reframes.</p>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

// Missing icon import workaround
const BookOpen = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

export default JournalDetail;
