import './Login.css';
import {ReactComponent as Logo} from '../google_buttn.svg';

interface LoginProps {
  signIn: any
}

function Login(props: LoginProps) {

  return (
    <div className='auth'>
      <h1>Wordle VS</h1>
      <button className='login' onClick={props.signIn}>
        <Logo className='logo' />
        <span className='signin'>Sign in with Google</span>
      </button>
    </div>
  );
}

export default Login;
