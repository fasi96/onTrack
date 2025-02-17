import { Box } from "@mui/material";
import { ProgressLog } from "../../types/goal";

interface ProgressGraphProps {
	logs: ProgressLog[];
	goalType: "HOURS" | "SESSIONS";
}

const ProgressGraph = ({ logs, goalType }: ProgressGraphProps) => {
	// For now, return a simple placeholder
	return (
		<Box sx={{ height: 200, width: "100%", bgcolor: "background.paper" }}>
			{/* Graph implementation will go here */}
			{logs.length === 0 ? (
				<Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
					No progress data to display
				</Box>
			) : (
				<Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
					Progress visualization coming soon
				</Box>
			)}
		</Box>
	);
};

export default ProgressGraph;
