import { useLocation, useNavigate } from "react-router-dom"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "react-toastify"
import GoogleIcon from '@mui/icons-material/Google';

const OAuth = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const onGoogleClick = async () => {
        try {
            const auth = getAuth()
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            // Check for user

            // If user doesn't exist, create user

            toast.success('Logged in successfully.')
            navigate('/')
        } catch (error) {
            toast.error('Could not authorize with Google.')
        }
    }

    return (
        <div className="socialLogin">
            {/* <p>Sign {location.pathname === '/sign-up' ? 'up' : 'in'} with</p>
            <button className="socialIconDiv" onClick={onGoogleClick}>
                <GoogleIcon />
            </button> */}
        </div>
    )
}

export default OAuth