'use client';

import { useState } from 'react';
import { GoalCategory } from '../lib/types';
import { useGoalTrack } from '../context/GoalTrackContext';

interface AddGoalFormProps {
  onClose?: () => void;
}

export const AddGoalForm: React.FC<AddGoalFormProps> = ({ onClose }) => {
  const { addGoal } = useGoalTrack();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('personal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      description: description.trim(),
      category,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('personal');
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Goal</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GoalCategory)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="personal">Personal</option>
            <option value="organizational">Organizational</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 order-1 sm:order-1"
        >
          Add Goal
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 order-2 sm:order-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};