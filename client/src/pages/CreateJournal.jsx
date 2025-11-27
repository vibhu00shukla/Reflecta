import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Sparkles, Smile, Frown, Meh, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateJournal = () => {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            moodScore: 5,
            createdAt: new Date().toISOString().split('T')[0]
        }
    });
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const currentMood = watch('moodScore');

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await axios.post('http://localhost:3000/journals', data);
            navigate('/');
        } catch (error) {
            console.error("Failed to create journal", error);
            alert("Failed to save journal. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getMoodIcon = (score) => {
        if (score >= 8) return <Smile className="h-8 w-8 text-green-500" />;
        if (score >= 4) return <Meh className="h-8 w-8 text-yellow-500" />;
        return <Frown className="h-8 w-8 text-red-500" />;
    };

    const getMoodLabel = (score) => {
        if (score >= 9) return "Amazing";
        if (score >= 7) return "Good";
        if (score >= 5) return "Okay";
        if (score >= 3) return "Not Great";
        return "Rough";
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
            </div>

            <nav className="glass sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors flex items-center font-medium">
                            <div className="bg-white/50 p-1.5 rounded-full mr-2 hover:bg-white transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </div>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">New Entry</h1>
                        <div className="w-24"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card rounded-2xl p-6 md:p-8"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Header Section */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary-100 p-3 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">What's on your mind?</h3>
                                    <p className="mt-1 text-gray-500">
                                        Express yourself freely. Our AI is here to listen and help you reflect.
                                    </p>
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div className="flex items-center space-x-2 bg-white/50 rounded-lg p-2 border border-gray-200">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <input
                                    type="date"
                                    {...register('createdAt')}
                                    className="bg-transparent border-none text-sm text-gray-700 focus:ring-0 p-0"
                                />
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="relative">
                            <textarea
                                id="entryText"
                                rows={12}
                                className="block w-full rounded-xl border-gray-200 bg-white/50 p-4 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-lg leading-relaxed resize-none transition-all"
                                placeholder="Today I felt..."
                                {...register('entryText', { required: 'Entry text is required' })}
                            />
                            {errors.entryText && (
                                <p className="absolute -bottom-6 left-0 text-red-500 text-sm">{errors.entryText.message}</p>
                            )}
                        </div>

                        {/* Mood Selector */}
                        <div className="bg-white/40 rounded-xl p-6 border border-white/50">
                            <label htmlFor="moodScore" className="block text-sm font-medium text-gray-700 mb-4">
                                How are you feeling? (1-10)
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0 transition-transform transform key={currentMood}">
                                    {getMoodIcon(currentMood)}
                                </div>
                                <div className="flex-grow">
                                    <input
                                        type="range"
                                        id="moodScore"
                                        min="1"
                                        max="10"
                                        step="1"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                        {...register('moodScore', { min: 1, max: 10 })}
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                        <span>Rough</span>
                                        <span>Okay</span>
                                        <span>Amazing</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 w-24 text-right">
                                    <span className="text-2xl font-bold text-primary-700">{currentMood}</span>
                                    <span className="block text-xs text-gray-500 font-medium">{getMoodLabel(currentMood)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Link
                                to="/"
                                className="px-6 py-3 border border-transparent text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 mr-4 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save Entry
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default CreateJournal;
