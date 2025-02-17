import { useState } from "react";
import {
	Container,
	Typography,
	Button,
	Box,
	Grid,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	RadioGroup,
	FormControlLabel,
	Radio,
	CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";
import GoalCard from "../components/goals/GoalCard";
import { useGoals } from "../hooks/useGoals";
import { GoalFormData } from "../types/goal";

const Dashboard = () => {
	const { goals, error, isLoading, addGoal, clearAllGoals } = useGoals();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
	const [formData, setFormData] = useState<GoalFormData>({
		title: "",
		type: "SESSIONS",
		targetAmount: 0,
		maxPerDay: 1,
		startDate: format(new Date(), "yyyy-MM-dd"),
		endDate: format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd"),
	});

	const handleCreateGoal = () => {
		addGoal(formData);
		setIsCreateDialogOpen(false);
		setFormData({
			title: "",
			type: "SESSIONS",
			targetAmount: 0,
			maxPerDay: 1,
			startDate: format(new Date(), "yyyy-MM-dd"),
			endDate: format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd"),
		});
	};

	const handleClearAllGoals = () => {
		clearAllGoals();
		setIsClearDialogOpen(false);
	};

	const handleChange =
		(field: keyof GoalFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({
				...prev,
				[field]:
					field === "targetAmount" || field === "maxPerDay"
						? Number(e.target.value)
						: e.target.value,
			}));
		};

	if (isLoading) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					minHeight="60vh"
				>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={4}
			>
				<Typography variant="h4" component="h1">
					Your Goals
				</Typography>
				<Box>
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => setIsClearDialogOpen(true)}
						sx={{ mr: 2 }}
					>
						Clear All
					</Button>
					<Button
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={() => setIsCreateDialogOpen(true)}
					>
						Create New Goal
					</Button>
				</Box>
			</Box>

			<Grid container spacing={3}>
				{goals.length === 0 ? (
					<Grid item xs={12}>
						<Box
							display="flex"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							py={8}
						>
							<Typography variant="h6" color="text.secondary" gutterBottom>
								No goals yet
							</Typography>
							<Typography color="text.secondary" mb={2}>
								Create your first goal to start tracking your progress
							</Typography>
							<Button
								variant="outlined"
								color="primary"
								startIcon={<AddIcon />}
								onClick={() => setIsCreateDialogOpen(true)}
							>
								Create Goal
							</Button>
						</Box>
					</Grid>
				) : (
					goals.map((goal) => (
						<Grid item xs={12} md={6} lg={4} key={goal.id}>
							<GoalCard goal={goal} />
						</Grid>
					))
				)}
			</Grid>

			<Dialog
				open={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Create New Goal</DialogTitle>
				<DialogContent>
					<Box sx={{ mt: 2 }}>
						<TextField
							fullWidth
							label="Goal Title"
							value={formData.title}
							onChange={handleChange("title")}
							margin="normal"
							required
						/>

						<Box sx={{ mt: 3, mb: 2 }}>
							<Typography variant="subtitle1" gutterBottom>
								Goal Type
							</Typography>
							<RadioGroup
								row
								value={formData.type}
								onChange={handleChange("type")}
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
								formData.type === "HOURS" ? "Hours" : "Sessions"
							}`}
							type="number"
							value={formData.targetAmount}
							onChange={handleChange("targetAmount")}
							margin="normal"
							required
							inputProps={{ min: 1 }}
						/>

						<TextField
							fullWidth
							label={`Maximum ${
								formData.type === "HOURS" ? "Hours" : "Sessions"
							} per Day`}
							type="number"
							value={formData.maxPerDay}
							onChange={handleChange("maxPerDay")}
							margin="normal"
							required
							inputProps={{ min: 1 }}
							helperText="Set a daily limit to help pace your progress"
						/>

						<TextField
							fullWidth
							label="Start Date"
							type="date"
							value={formData.startDate}
							onChange={handleChange("startDate")}
							margin="normal"
							required
							InputLabelProps={{ shrink: true }}
						/>

						<TextField
							fullWidth
							label="End Date"
							type="date"
							value={formData.endDate}
							onChange={handleChange("endDate")}
							margin="normal"
							required
							InputLabelProps={{ shrink: true }}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleCreateGoal}
						variant="contained"
						color="primary"
					>
						Create Goal
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={isClearDialogOpen}
				onClose={() => setIsClearDialogOpen(false)}
			>
				<DialogTitle>Clear All Goals</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete all goals? This action cannot be
						undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsClearDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleClearAllGoals}
						variant="contained"
						color="error"
					>
						Clear All Goals
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Dashboard;
