import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";

// Create a theme instance
const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#dc004e",
		},
		background: {
			default: "#f5f5f5",
		},
	},
});

function App() {
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			console.error("Error caught by error handler:", event.error);
			setError(event.error);
		};

		window.addEventListener("error", handleError);
		return () => window.removeEventListener("error", handleError);
	}, []);

	if (error) {
		return (
			<div style={{ padding: 20, color: "red" }}>
				<h1>Something went wrong</h1>
				<pre>{error.message}</pre>
				<button onClick={() => window.location.reload()}>Reload Page</button>
			</div>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Dashboard />
		</ThemeProvider>
	);
}

export default App;
