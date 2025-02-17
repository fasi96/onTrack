import { useState } from "react";
import {
	Card,
	CardContent,
	Typography,
	LinearProgress,
	Box,
	IconButton,
	Collapse,
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	List,
	ListItem,
	ListItemText,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import {
	ExpandMore as ExpandMoreIcon,
	Edit as EditIcon,
} from "@mui/icons-material";
import {
	format,
	differenceInDays,
	isAfter,
	isBefore,
	parseISO,
	isValid,
} from "date-fns";
import { Goal, GoalFormData } from "../../types/goal";
import ProgressGraph from "./ProgressGraph";
import { useGoals } from "../../hooks/useGoals";

interface GoalCardProps {
	goal: Goal;
}

const GoalCard = ({ goal }: GoalCardProps) => {
	const { addProgressLog, updateGoal } = useGoals();
	const [expanded, setExpanded] = useState(false);
	const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [progressAmount, setProgressAmount] = useState("");
	const [progressNote, setProgressNote] = useState("");
	const [progressDate, setProgressDate] = useState(
		format(new Date(), "yyyy-MM-dd")
	);
	const [editFormData, setEditFormData] = useState<GoalFormData>({
		title: goal.title,
		type: goal.type,
		targetAmount: goal.targetAmount,
		maxPerDay: goal.maxPerDay,
		startDate: goal.startDate,
		endDate: goal.endDate,
	});

	const completionPercentage = Math.min(
		(goal.progress / goal.targetAmount) * 100,
		100
	);

	// Safely calculate days remaining
	const daysRemaining = (() => {
		try {
			const endDate = new Date(goal.endDate);
			return isValid(endDate) ? differenceInDays(endDate, new Date()) : 0;
		} catch (error) {
			return 0;
		}
	})();

	const handleLogProgress = () => {
		if (progressAmount) {
			const amount = Number(progressAmount);

			// Check if the amount exceeds max per day
			const logsForDate = goal.logs.filter((log) => log.date === progressDate);
			const totalForDate = logsForDate.reduce(
				(sum, log) => sum + log.amount,
				0
			);

			if (totalForDate + amount > goal.maxPerDay) {
				alert(
					`You can't exceed ${
						goal.maxPerDay
					} ${goal.type.toLowerCase()} per day`
				);
				return;
			}

			// Check if the date is within range
			if (
				isBefore(parseISO(progressDate), parseISO(goal.startDate)) ||
				isAfter(parseISO(progressDate), parseISO(goal.endDate))
			) {
				alert("Please select a date within the goal's date range");
				return;
			}

			addProgressLog(goal.id, amount, progressNote, progressDate);
			setProgressAmount("");
			setProgressNote("");
			setProgressDate(format(new Date(), "yyyy-MM-dd"));
			setIsLogDialogOpen(false);
		}
	};

	const handleEditGoal = () => {
		updateGoal({ ...goal, ...editFormData });
		setIsEditDialogOpen(false);
	};

	const handleEditChange =
		(field: keyof GoalFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setEditFormData((prev) => ({
				...prev,
				[field]:
					field === "targetAmount" || field === "maxPerDay"
						? Number(e.target.value)
						: e.target.value,
			}));
		};

	// Safe date formatting function
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid Date";
		} catch (error) {
			return "Invalid Date";
		}
	};

	return (
		<>
			<Card>
				<CardContent>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="flex-start"
					>
						<Typography variant="h6" gutterBottom>
							{goal.title}
						</Typography>
						<Box>
							<IconButton
								onClick={() => setIsEditDialogOpen(true)}
								size="small"
							>
								<EditIcon />
							</IconButton>
							<IconButton
								onClick={() => setExpanded(!expanded)}
								sx={{
									transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
									transition: "transform 0.3s",
								}}
							>
								<ExpandMoreIcon />
							</IconButton>
						</Box>
					</Box>

					<Box mb={2}>
						<Box display="flex" justifyContent="space-between" mb={1}>
							<Typography variant="body2" color="text.secondary">
								Progress
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{Math.round(completionPercentage)}%
							</Typography>
						</Box>
						<LinearProgress
							variant="determinate"
							value={completionPercentage}
							sx={{ height: 8, borderRadius: 4 }}
						/>
					</Box>

					<Box display="flex" justifyContent="space-between">
						<Typography variant="body2" color="text.secondary">
							{goal.type === "HOURS" ? "Hours" : "Sessions"}: {goal.progress}/
							{goal.targetAmount} (Max {goal.maxPerDay}/day)
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{daysRemaining} days left
						</Typography>
					</Box>

					<Collapse in={expanded} timeout="auto" unmountOnExit>
						<Box mt={2}>
							<Typography variant="subtitle2" gutterBottom>
								Progress Timeline
							</Typography>
							<ProgressGraph logs={goal.logs} goalType={goal.type} />

							<Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
								Progress Logs
							</Typography>
							<List dense>
								{goal.logs.length === 0 ? (
									<ListItem>
										<ListItemText secondary="No progress logged yet" />
									</ListItem>
								) : (
									goal.logs.map((log) => (
										<ListItem key={log.id}>
											<ListItemText
												primary={`${log.amount} ${
													goal.type === "HOURS" ? "hours" : "sessions"
												}`}
												secondary={
													<>
														{formatDate(log.date)}
														{log.note && ` - ${log.note}`}
													</>
												}
											/>
										</ListItem>
									))
								)}
							</List>

							<Box mt={2}>
								<Button
									variant="outlined"
									color="primary"
									fullWidth
									size="small"
									onClick={() => setIsLogDialogOpen(true)}
								>
									Log Progress
								</Button>
							</Box>
						</Box>
					</Collapse>
				</CardContent>
			</Card>

			{/* Log Progress Dialog */}
			<Dialog open={isLogDialogOpen} onClose={() => setIsLogDialogOpen(false)}>
				<DialogTitle>Log Progress</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						type="date"
						label="Date"
						value={progressDate}
						onChange={(e) => setProgressDate(e.target.value)}
						margin="normal"
						required
						InputLabelProps={{ shrink: true }}
					/>
					<TextField
						autoFocus
						margin="dense"
						label={`${goal.type === "HOURS" ? "Hours" : "Sessions"} Completed`}
						type="number"
						fullWidth
						value={progressAmount}
						onChange={(e) => setProgressAmount(e.target.value)}
						inputProps={{
							min: 0,
							step: goal.type === "HOURS" ? 0.5 : 1,
						}}
					/>
					<TextField
						margin="dense"
						label="Note (optional)"
						type="text"
						fullWidth
						value={progressNote}
						onChange={(e) => setProgressNote(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsLogDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleLogProgress}
						variant="contained"
						color="primary"
					>
						Save Progress
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Goal Dialog */}
			<Dialog
				open={isEditDialogOpen}
				onClose={() => setIsEditDialogOpen(false)}
			>
				<DialogTitle>Edit Goal</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label="Goal Title"
						value={editFormData.title}
						onChange={handleEditChange("title")}
						margin="normal"
						required
					/>

					<Box sx={{ mt: 3, mb: 2 }}>
						<Typography variant="subtitle1" gutterBottom>
							Goal Type
						</Typography>
						<RadioGroup
							row
							value={editFormData.type}
							onChange={handleEditChange("type")}
						>
							<FormControlLabel
								value="SESSIONS"
								control={<Radio />}
								label="Sessions"
							/>
							<FormControlLabel
								value="HOURS"
								control={<Radio />}
								label="Hours"
							/>
						</RadioGroup>
					</Box>

					<TextField
						fullWidth
						label={`Target ${
							editFormData.type === "HOURS" ? "Hours" : "Sessions"
						}`}
						type="number"
						value={editFormData.targetAmount}
						onChange={handleEditChange("targetAmount")}
						margin="normal"
						required
						inputProps={{ min: 1 }}
					/>

					<TextField
						fullWidth
						label={`Maximum ${
							editFormData.type === "HOURS" ? "Hours" : "Sessions"
						} per Day`}
						type="number"
						value={editFormData.maxPerDay}
						onChange={handleEditChange("maxPerDay")}
						margin="normal"
						required
						inputProps={{ min: 1 }}
					/>

					<TextField
						fullWidth
						label="Start Date"
						type="date"
						value={editFormData.startDate}
						onChange={handleEditChange("startDate")}
						margin="normal"
						required
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						fullWidth
						label="End Date"
						type="date"
						value={editFormData.endDate}
						onChange={handleEditChange("endDate")}
						margin="normal"
						required
						InputLabelProps={{ shrink: true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleEditGoal} variant="contained" color="primary">
						Save Changes
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default GoalCard;
