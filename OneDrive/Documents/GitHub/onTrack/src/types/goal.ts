export type GoalType = "HOURS" | "SESSIONS";

export interface ProgressLog {
	id: string;
	amount: number;
	note: string;
	date: string;
	timestamp: string;
}

export interface Goal {
	id: string;
	title: string;
	type: GoalType;
	targetAmount: number;
	maxPerDay: number;
	startDate: string;
	endDate: string;
	progress: number;
	logs: ProgressLog[];
	createdAt: string;
}

export interface GoalFormData {
	title: string;
	type: GoalType;
	targetAmount: number;
	maxPerDay: number;
	startDate: string;
	endDate: string;
}
