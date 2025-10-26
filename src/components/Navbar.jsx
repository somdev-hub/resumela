import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/auth";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  deleteUser,
} from "firebase/auth";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  // Avatar menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Dialog states
  const [openChangeEmail, setOpenChangeEmail] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openReauth, setOpenReauth] = useState(false);

  // Form fields and errors
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [actionError, setActionError] = useState(null);

  // pending action after reauth: 'email' | 'password' | 'delete'
  const [pendingAction, setPendingAction] = useState(null);

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleAvatarClose = () => setAnchorEl(null);

  const tryUpdateEmail = async (emailValue) => {
    if (!auth.currentUser) return;
    setActionError(null);
    try {
      await updateEmail(auth.currentUser, emailValue);
      setOpenChangeEmail(false);
      handleAvatarClose();
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setPendingAction("email");
        setOpenReauth(true);
      } else {
        setActionError(err.message || "Failed to update email");
      }
    }
  };

  const tryUpdatePassword = async (passwordValue) => {
    if (!auth.currentUser) return;
    setActionError(null);
    try {
      await updatePassword(auth.currentUser, passwordValue);
      setOpenChangePassword(false);
      handleAvatarClose();
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setPendingAction("password");
        setOpenReauth(true);
      } else {
        setActionError(err.message || "Failed to update password");
      }
    }
  };

  const tryDeleteAccount = async () => {
    if (!auth.currentUser) return;
    setActionError(null);
    try {
      await deleteUser(auth.currentUser);
      setOpenDeleteConfirm(false);
      handleAvatarClose();
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setPendingAction("delete");
        setOpenReauth(true);
      } else {
        setActionError(err.message || "Failed to delete account");
      }
    }
  };

  const handleReauthWithPassword = async () => {
    if (!auth.currentUser) return;
    setActionError(null);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        reauthPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      setOpenReauth(false);
      if (pendingAction === "email") await tryUpdateEmail(newEmail);
      if (pendingAction === "password") await tryUpdatePassword(newPassword);
      if (pendingAction === "delete") await tryDeleteAccount();
      setPendingAction(null);
      setReauthPassword("");
    } catch (err) {
      setActionError(err.message || "Re-authentication failed");
    }
  };

  const handleReauthWithGoogle = async () => {
    if (!auth.currentUser) return;
    setActionError(null);
    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(auth.currentUser, provider);
      setOpenReauth(false);
      if (pendingAction === "email") await tryUpdateEmail(newEmail);
      if (pendingAction === "password") await tryUpdatePassword(newPassword);
      if (pendingAction === "delete") await tryDeleteAccount();
      setPendingAction(null);
    } catch (err) {
      setActionError(err.message || "Re-authentication failed");
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 py-4 bg-white/30 backdrop-blur-md shadow-lg rounded-xl w-full mb-8">
        <h1 className="text-2xl font-bold">Resumela</h1>
        <ul className="flex flex-1 justify-center gap-8 list-none m-0 p-0">
          <li className="text-lg">Home</li>
          <li className="text-lg">About</li>
          <li className="text-lg">Contact</li>
        </ul>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button
                onClick={() => setShowSignup(true)}
                className="mr-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold"
              >
                Sign Up
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-200 font-semibold"
              >
                Log In
              </button>
            </>
          ) : (
            <>
              <Typography className="hidden sm:block text-sm text-gray-700">
                {user.email}
              </Typography>
              <IconButton onClick={handleAvatarClick} size="small">
                <Avatar sx={{ width: 32, height: 32 }} src={user.photoURL}>
                  {user.displayName
                    ? user.displayName[0]
                    : user.email
                    ? user.email[0]
                    : "U"}
                </Avatar>
              </IconButton>
            </>
          )}
        </div>
      </nav>

      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
      {/* Avatar menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleAvatarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box
          sx={{ px: 2, py: 1, display: "flex", gap: 2, alignItems: "center" }}
        >
          <Avatar src={user?.photoURL} sx={{ width: 48, height: 48 }}>
            {user?.displayName
              ? user.displayName[0]
              : user?.email
              ? user.email[0]
              : "U"}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">
              {user?.displayName || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setOpenChangeEmail(true);
            handleAvatarClose();
          }}
        >
          Change email
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenChangePassword(true);
            handleAvatarClose();
          }}
        >
          Change password
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: "error.main",
            border: "1px solid",
            borderColor: "error.light",
            m: 1,
            borderRadius: 1,
            justifyContent: "center",
          }}
        >
          Log out
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenDeleteConfirm(true);
            handleAvatarClose();
          }}
          sx={{
            color: "white",
            backgroundColor: "error.main",
            "&:hover": { backgroundColor: "error.dark" },
            m: 1,
            borderRadius: 1,
            justifyContent: "center",
          }}
        >
          Delete account
        </MenuItem>
      </Menu>

      {/* Change Email Dialog */}
      <Dialog open={openChangeEmail} onClose={() => setOpenChangeEmail(false)}>
        <DialogTitle>Change email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New email"
            type="email"
            fullWidth
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {actionError && (
            <Typography color="error" variant="body2">
              {actionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangeEmail(false)}>Cancel</Button>
          <Button onClick={() => tryUpdateEmail(newEmail)} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
      >
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {actionError && (
            <Typography color="error" variant="body2">
              {actionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangePassword(false)}>Cancel</Button>
          <Button
            onClick={() => tryUpdatePassword(newPassword)}
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <DialogTitle>Delete account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Typography>
          {actionError && (
            <Typography color="error" variant="body2">
              {actionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
          <Button
            onClick={() => tryDeleteAccount()}
            color="error"
            variant="outlined"
          >
            Delete account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-authentication Dialog */}
      <Dialog open={openReauth} onClose={() => setOpenReauth(false)}>
        <DialogTitle>Re-authenticate</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            For security, please re-authenticate to continue.
          </Typography>
          <TextField
            margin="dense"
            label="Current password"
            type="password"
            fullWidth
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
          />
          {actionError && (
            <Typography color="error" variant="body2">
              {actionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReauth(false)}>Cancel</Button>
          <Button onClick={handleReauthWithPassword}>
            Re-authenticate (password)
          </Button>
          <Button onClick={handleReauthWithGoogle} variant="outlined">
            Re-authenticate with Google
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
