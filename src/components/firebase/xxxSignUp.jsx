import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from './firebaseConfig'; // Firebase config
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterForm = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            await signOut(auth); // Cerrar la sesión automáticamente tras el registro
            toast.success('Revise su correo para verificar su cuenta.');

            // Redirige a la página de inicio de sesión tras un tiempo
            setTimeout(() => {
                navigate('/login');
            }, 5000); // Tiempo del autoClose del toast
        } catch (err) {
            console.error("Error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, marginBottom: '1000px' }}>
                <Typography variant="h5">Registro</Typography>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <TextField
                            label="Contraseña"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        >
                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                    </Box>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <TextField
                            label="Confirmar Contraseña"
                            type={showConfirmPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <IconButton
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        >
                            {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                    </Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                color="primary"
                                required
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Acepto los{" "}
                                <a href="/terms" target="_blank" rel="noopener noreferrer">
                                    Términos de Uso
                                </a>{" "}
                                y la{" "}
                                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                    Política de Privacidad
                                </a>.
                            </Typography>
                        }
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </Button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link to="/login">Ya tengo una cuenta</Link>
                </div>
                {/* <ToastContainer /> */}
            </Box>
        </Container>
    );
};

export default RegisterForm;
