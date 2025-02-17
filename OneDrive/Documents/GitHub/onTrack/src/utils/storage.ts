import { Goal, GoalFormData } from "../types/goal";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "ontrack_goals";

export const getGoals = (): Goal[] => {
	try {
		const goalsJson = localStorage.getItem(STORAGE_KEY);
		return goalsJson ? JSON.parse(goalsJson) : [];
	} catch (error) {
		console.error("Error reading goals from localStorage:", error);
		return [];
	}
};

export const clearAllGoals = (): void => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error("Error clearing goals from localStorage:", error);
		throw error;
	}
};

export const saveGoal = (goalData: GoalFormData): Goal => {
	try {
		const goals = getGoals();
		const newGoal: Goal = {
			...goalData,
			id: uuidv4(),
			progress: 0,
			logs: [],
			createdAt: new Date().toISOString(),
		};

		goals.push(newGoal);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
		return newGoal;
	} catch (error) {
		console.error("Error saving goal to localStorage:", error);
		throw error;
	}
};

export const updateGoal = (goal: Goal): void => {
	try {
		const goals = getGoals();
		const index = goals.findIndex((g) => g.id === goal.id);

		if (index !== -1) {
			goals[index] = goal;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
		}
	} catch (error) {
		console.error("Error updating goal in localStorage:", error);
		throw error;
	}
};

export const deleteGoal = (goalId: string): void => {
	try {
		const goals = getGoals();
		const filteredGoals = goals.filter((goal) => goal.id !== goalId);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGoals));
	} catch (error) {
		console.error("Error deleting goal from localStorage:", error);
		throw error;
	}
};

export const addProgressLog = (
	goalId: string,
	amount: number,
	note: string,
	date: string
): Goal | null => {
	try {
		const goals = getGoals();
		const goalIndex = goals.findIndex((g) => g.id === goalId);

		if (goalIndex === -1) return null;

		const goal = goals[goalIndex];
		const newLog = {
			id: uuidv4(),
			timestamp: new Date().toISOString(),
			amount,
			note,
			date,
		};

		goal.logs.push(newLog);
		goal.progress += amount;

		goals[goalIndex] = goal;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));

		return goal;
	} catch (error) {
		console.error("Error adding progress log in localStorage:", error);
		throw error;
	}
};
