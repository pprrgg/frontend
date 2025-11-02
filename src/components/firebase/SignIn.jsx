import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/Forward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;

            // Verificar si el correo electrónico ha sido verificado
            if (!user.emailVerified) {
                await auth.signOut(); // Cierra sesión si el correo no está verificado

                toast.error('Por favor, verifica tu correo antes de iniciar sesión.');
                return; // Detener el flujo aquí si no está verificado
            }

            toast.success('Inicio de sesión exitoso.');

            setTimeout(() => {
                navigate('/'); // Redirige a la página principal o perfil
            }, 3000); // Tiempo del autoClose del toast
        } catch (error) {
            console.error("Error en inicio de sesión:", error.message);
            toast.error('Credenciales incorrectas.');
        }
    };


    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, marginBottom: '1000px' }}>
            <Typography variant="h5" align="center" gutterBottom>
                Inicio de sesión
            </Typography>
            <form onSubmit={onSubmit}>
                <TextField
                    type="email"
                    label="Email"
                    id="email"
                    value={email}
                    onChange={onChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="outlined"
                />

                <Box sx={{ position: 'relative', mb: 2 }}>
                    <TextField
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        id="password"
                        value={password}
                        onChange={onChange}
                        fullWidth
                        variant="outlined"
                    />
                    <IconButton
                        onClick={() => setShowPassword((prevState) => !prevState)}
                        sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                        aria-label="toggle password visibility"
                    >
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowRightIcon />}
                    sx={{ mb: 2 }}
                >
                    Iniciar sesión
                </Button>


                <Link to='/forgot-password' style={{ display: 'block', textAlign: 'center', marginBottom: 88 }}>
                    ¿Has olvidado tu contraseña?
                </Link>
                <Typography variant="h5" align="center" gutterBottom>

                </Typography>

                <Button

                    component={Link}
                    to="/sign-up" // Ruta a la que redirige el botón
                    fullWidth
                    variant="outlined" // Botón sin relleno por defecto
                    endIcon={<ArrowRightIcon />}
                    sx={{
                        mb: 2,
                        '&:hover': {
                            backgroundColor: 'primary.main', // Relleno al pasar el ratón
                            color: 'white', // Cambiar el color del texto si es necesario
                        },
                    }}                >

                    ¿No tienes cuenta? Regístrate
                </Button>

            </form>
            <ToastContainer />

            {/* Uncomment if you want to include OAuth */}
            {/* <OAuth /> */}

        </Box>
    );
};

export default SignIn;
