import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/auth";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";

const GoogleSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20"
    height="20"
  >
    <path
      fill="#fbc02d"
      d="M43.6 20.5H42V20H24v8h11.3C34.9 32.7 30.1 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.2 0 6.1 1.2 8.3 3.1l5.7-5.7C34.6 3.6 29.6 1 24 1 11.8 1 .9 11.9.9 24S11.8 47 24 47c12.3 0 22.1-8.6 22.1-22 0-1.5-.2-2.9-.6-4.2z"
    />
    <path
      fill="#e53935"
      d="M6.3 14.7l6.6 4.8C14.1 16.6 18.7 13 24 13c3.2 0 6.1 1.2 8.3 3.1l5.7-5.7C34.6 3.6 29.6 1 24 1 15.9 1 8.9 5.9 6.3 14.7z"
    />
    <path
      fill="#4caf50"
      d="M24 47c6.1 0 11.6-2.3 15.8-6.1l-7.3-5.9c-2.1 1.6-4.8 2.6-8.5 2.6-6 0-10.8-3.3-13.1-8.1L6.3 33.3C9 41.1 15.9 47 24 47z"
    />
    <path
      fill="#1565c0"
      d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-2.9 4.9-5.3 6.5 0 .1 0 .1 0 .1l7.6 6.1C40.7 40.6 47 33.6 47 24c0-1.5-.2-2.9-.6-4.2-.8-2.9-2.5-5.5-4.8-7.3z"
    />
  </svg>
);

const LoginForm = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <Typography variant="h6" component="h3" className="mb-2">
          Log In
        </Typography>

        {error && (
          <Typography color="error" variant="body2" className="mb-2">
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: 1,
              mt: 1,
            }}
          >
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            New here?{" "}
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => {
                onClose && onClose();
                onSwitchToSignup && onSwitchToSignup();
              }}
            >
              Create an account
            </MuiLink>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          variant="outlined"
          startIcon={GoogleSvg}
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
