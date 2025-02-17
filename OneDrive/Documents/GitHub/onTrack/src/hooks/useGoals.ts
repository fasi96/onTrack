import { useState, useEffect } from "react";
import { Goal, GoalFormData } from "../types/goal";
import * as storage from "../utils/storage";

export const useGoals = () => {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadGoals = async () => {
			try {
				setIsLoading(true);
				const loadedGoals = storage.getGoals();
				setGoals(loadedGoals);
				setError(null);
			} catch (err) {
				console.error("Error loading goals:", err);
				setError("Failed to load goals");
			} finally {
				setIsLoading(false);
			}
		};

		loadGoals();
	}, []);

	const clearAllGoals = () => {
		try {
			storage.clearAllGoals();
			setGoals([]);
			setError(null);
		} catch (err) {
			console.error("Error clearing goals:", err);
			setError("Failed to clear goals");
			throw err;
		}
	};

	const addGoal = (goalData: GoalFormData) => {
		try {
			const newGoal = storage.saveGoal(goalData);
			setGoals((prevGoals) => [...prevGoals, newGoal]);
			setError(null);
			return newGoal;
		} catch (err) {
			console.error("Error adding goal:", err);
			setError("Failed to add goal");
			throw err;
		}
	};

	const updateGoal = (goal: Goal) => {
		try {
			storage.updateGoal(goal);
			setGoals((prevGoals) =>
				prevGoals.map((g) => (g.id === goal.id ? goal : g))
			);
			setError(null);
		} catch (err) {
			console.error("Error updating goal:", err);
			setError("Failed to update goal");
			throw err;
		}
	};

	const deleteGoal = (goalId: string) => {
		try {
			storage.deleteGoal(goalId);
			setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));
			setError(null);
		} catch (err) {
			console.error("Error deleting goal:", err);
			setError("Failed to delete goal");
			throw err;
		}
	};

	const addProgressLog = (
		goalId: string,
		amount: number,
		note: string,
		date: string
	) => {
		try {
			const updatedGoal = storage.addProgressLog(goalId, amount, note, date);
			if (updatedGoal) {
				setGoals((prevGoals) =>
					prevGoals.map((g) => (g.id === goalId ? updatedGoal : g))
				);
				setError(null);
				return updatedGoal;
			}
			return null;
		} catch (err) {
			console.error("Error adding progress log:", err);
			setError("Failed to add progress log");
			throw err;
		}
	};

	return {
		goals,
		error,
		isLoading,
		addGoal,
		updateGoal,
		deleteGoal,
		addProgressLog,
		clearAllGoals,
	};
};
