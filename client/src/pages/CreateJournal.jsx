import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';

const CreateJournal = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">New Entry</h1>
                        <div className="w-20"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Journal Entry</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Write down your thoughts, feelings, and experiences. The AI will analyze this to help you reflect.
                                </p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6">
                                        <label htmlFor="entryText" className="block text-sm font-medium text-gray-700">
                                            What's on your mind?
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="entryText"
                                                rows={12}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                                                placeholder="Today I felt..."
                                                {...register('entryText', { required: 'Entry text is required' })}
                                            />
                                        </div>
                                        {errors.entryText && <p className="text-red-500 text-xs mt-1">{errors.entryText.message}</p>}
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="moodScore" className="block text-sm font-medium text-gray-700">
                                            Mood (1-10)
                                        </label>
                                        <input
                                            type="number"
                                            id="moodScore"
                                            min="1"
                                            max="10"
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            {...register('moodScore', { min: 1, max: 10 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            to="/"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {submitting ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateJournal;
