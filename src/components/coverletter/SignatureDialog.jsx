import { Dialog, DialogTitle, DialogContent, TextField, MenuItem, Typography, DialogActions, Button } from "@mui/material";
import React, { useState } from "react";

const fonts = [
    { label: "Dancing Script", value: "'Dancing Script', cursive" },
    { label: "Pacifico", value: "'Pacifico', cursive" },
    { label: "Satisfy", value: "'Satisfy', cursive" },
    { label: "Great Vibes", value: "'Great Vibes', cursive" },
    { label: "Indie Flower", value: "'Indie Flower', cursive" },
];

const SignatureDialog = ({ open, onClose }) => {
    const [name, setName] = useState("");
    const [selectedFont, setSelectedFont] = useState(fonts[0].value);

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleFontChange = (event) => {
        setSelectedFont(event.target.value);
    };

    return (
        <Dialog open={open} onClose={() => onClose()}>
            <DialogTitle>Add Signature</DialogTitle>
            <DialogContent>
                {/* Signature Preview */}
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                    <Typography
                        variant="h5"
                        style={{ fontFamily: selectedFont, border: "1px solid #ccc", padding: "10px" }}
                    >
                        {name || "Your Signature Preview"}
                    </Typography>
                </div>

                {/* Signature Input */}
                <div>
                    <TextField
                        label="Your Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        onChange={handleNameChange}
                        style={{ marginBottom: "20px" }}
                    />
                    <TextField
                        label="Select Font"
                        variant="outlined"
                        fullWidth
                        select
                        value={selectedFont}
                        onChange={handleFontChange}
                    >
                        {fonts.map((font) => (
                            <MenuItem key={font.value} value={font.value}>
                                {font.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => onClose({ name, selectedFont })}
                    disabled={!name}
                    variant="contained"
                    color="primary"
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SignatureDialog;
