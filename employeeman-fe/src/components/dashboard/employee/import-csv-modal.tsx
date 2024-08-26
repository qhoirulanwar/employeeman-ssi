import { Modal, Box, TextField, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { config } from '@/config';


const ImportCSVModal: React.FC<{
    open: boolean;
    onClose: () => void;
}> = ({ open, onClose }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${config.serverURL}/employees/import/csv`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('CSV imported successfully');
                onClose();
            } else {
                alert('Failed to import CSV');
            }
        } catch (error) {
            console.error('Error importing CSV:', error);
            alert('Error importing CSV');
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Import CSV
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        type="file"
                        onChange={handleFileChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                        Upload
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default ImportCSVModal;