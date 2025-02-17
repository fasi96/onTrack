import { useState, useEffect } from "react";
import { Goal, GoalFormData, ProgressLog } from "../types/goal";

const STORAGE_KEY = "ontrack_goals";

export const useGoals = () => {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load goals from localStorage on mount
	useEffect(() => {
		try {
			const storedGoals = localStorage.getItem(STORAGE_KEY);
			if (storedGoals) {
				setGoals(JSON.parse(storedGoals));
			}
		} catch (err) {
			setError("Failed to load goals");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Save goals to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
		} catch (err) {
			setError("Failed to save goals");
		}
	}, [goals]);

	const clearAllGoals = () => {
		try {
			localStorage.removeItem(STORAGE_KEY);
			setGoals([]);
			setError(null);
		} catch (err) {
			setError("Failed to clear goals");
		}
	};

	const addGoal = (formData: GoalFormData) => {
		try {
			const newGoal: Goal = {
				id: Date.now().toString(),
				...formData,
				progress: 0,
				logs: [],
				createdAt: new Date().toISOString(),
			};
			setGoals((prevGoals) => [...prevGoals, newGoal]);
			setError(null);
		} catch (err) {
			setError("Failed to add goal");
		}
	};

	const updateGoal = (updatedGoal: Goal) => {
		try {
			setGoals((prevGoals) =>
				prevGoals.map((goal) =>
					goal.id === updatedGoal.id ? updatedGoal : goal
				)
			);
			setError(null);
		} catch (err) {
			setError("Failed to update goal");
		}
	};

	const addProgressLog = (
		goalId: string,
		amount: number,
		note: string,
		date: string
	) => {
		try {
			setGoals((prevGoals) =>
				prevGoals.map((goal) => {
					if (goal.id === goalId) {
						const newLog: ProgressLog = {
							id: Date.now().toString(),
							amount,
							note,
							date,
							timestamp: new Date().toISOString(),
						};
						const updatedLogs = [...goal.logs, newLog];
						const totalProgress = updatedLogs.reduce(
							(sum, log) => sum + log.amount,
							0
						);
						return {
							...goal,
							logs: updatedLogs,
							progress: totalProgress,
						};
					}
					return goal;
				})
			);
			setError(null);
		} catch (err) {
			setError("Failed to log progress");
		}
	};

	return {
		goals,
		error,
		isLoading,
		addGoal,
		updateGoal,
		addProgressLog,
		clearAllGoals,
	};
};
