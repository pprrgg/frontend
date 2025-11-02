import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { TextField, Button, Box, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/Forward';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const onChange = (e) => {
        setEmail(e.target.value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            await sendPasswordResetEmail(auth, email);
            toast.success('Por favor, revise su correo');
            // alert('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');

            setTimeout(() => {
                navigate('/login');
            }, 3000); // Mismo tiempo que el autoClose del toast


        } catch (error) {
            toast.alert('Could not send reset email.');
        }
    };

    return (
        <Box className="pageContainer" sx={{ p: 3, maxWidth: 400, margin: 'auto', marginBottom: '1000px' }}>
            <header>
                <Typography variant="h5" align="center" gutterBottom>
                    Restaurar contraseña
                </Typography>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <TextField
                        type="email"
                        label="Email"
                        variant="outlined"
                        fullWidth
                        required
                        value={email}
                        onChange={onChange}
                        sx={{ mb: 2 }} // margin bottom
                    />
                    <Link to='/login' style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                            Inicia sesión
                        </Typography>
                    </Link>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">Send Reset Link</Typography>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            endIcon={<ArrowRightIcon />}
                        >
                            Send
                        </Button>
                    </Box>
                </form>
                <ToastContainer />

            </main>

        </Box>
    );
};

export default ForgotPassword;
