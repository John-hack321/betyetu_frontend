'use client'

import React, { createContext, useEffect , useState, ReactNode, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { AppDispatch } from '../app_state/store';
import { RootState } from '../app_state/store';
import { UseDispatch } from 'react-redux';
import { UserDataInterface } from '../app_state/slices/userData';
import { UseSelector } from 'react-redux';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateUserIdAndUsername } from '../app_state/slices/userData';

// the type of the user defined based on the kind of interaction that we have with the backend eg. the type of data that we expect from the backend 
type User = {
  username : string;
  id : number;
  email? : string;
}

type AuthContextType = { // here we get o define what data or function the auth context will share across our application 
  user: User | null | undefined ; // we have to add undefined in regard to the loading state 
  login: ( username : string , password: string) => Promise<void>;
  logout: () => void;
  loading : boolean;
  signup : (username: string, email: string, phone: string, password: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined); // the create context is used to create a context to share data accross our app ie. the logged in user 
// the definition of this up here also creates the actula context that we will use with createcontext 

export type AuthProviderProps = {
  children: ReactNode; // react node is a typescript type for children component in react 
};

// this auth provider defined down here now becomes a wraper that provides authentication to the entire app 
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null | undefined >(undefined); // this hook defination we use it to track who is logged in 
  const router = useRouter(); // and just from general knowledge we use this to naviagate the website programticaly 
  const [loading , setLoading] = useState(true);

  // based on best practices im told that we first have to check for the existing token on app load 

   // redux functionalities
   const useData = useSelector((state: RootState) => state.userData)

   const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token'); // so we first look for the token in the local storage 
        if (token) { // if the token is availabe then we do the thing below 
          // Set the token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // we first set the token on axios header for outgoing requests 
          
          // Decode the token to get user info (you can also fetch from an endpoint)
          const payload = JSON.parse(atob(token.split('.')[1])); // we then decode the jwt to get the data we want : username and id 
          
          // Check if token is expired
          if (payload.exp * 1000 > Date.now()) { // er first check if the token is expired 
            setUser({
              id: payload.id,
              username: payload.sub,
            });
          } else { // if it is expired we remove it from local storage and also remove from the headers from the frontend 
            // Token expired, remove it
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signup = async ( username : string , email : string ,phone : string ,  password : string ) => {

    try { // now we are going to define what happens on click of the sign up button 
      // since this time our data is going to be sent as payload rather than form data we are not going to use this for now 
    {/*
      const formData = new FormData();
      formData.append('password', passowrd);
      formData.append('username' , username);
      formData.append('email' , email);
      console.log('the user signup data is now being sent to the fast api backend ');
      */}

      const payload = {
        username,
        email,
        phone,
        password,
        }

        console.log(`payload constructed with data ${payload} now awaiting forwarding to the respective endpoint`)

        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
        const response = await axios.post(`${API_BASE_URL}/auth/`, payload, {
          headers : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json',
          }
        })

        console.log(`the payload has been sent successfuly , now awaiting access token from the backend`)

      const accessToken = response.data.access_token;
      console.log(`the access token has been received`)

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      localStorage.setItem('token' , accessToken);
      // now after the saving the access token in local storage we also need to store the current user in local storage 

      const payloadDecoded = JSON.parse(atob(accessToken.split('.')[1]));

      const userIdAndUsername = {
        id : payloadDecoded.id,
        username : payloadDecoded.sub,
      }
      setUser(userIdAndUsername)

      // before redirecting to the dashboard we upadte the usedata in the react store with the userid and the username 
      router.push("/dashboard");

    }
    catch (error){
      console.error("there was an error signing you up");
      throw(error);
    }
  }

  const login = async (username : string , password: string) => {
    try { // what we are doing here inside this function is we are creating form data expected by the fastapi auth2 endpoint 
      const formData = new FormData();
      formData.append('password', password);
      formData.append('username' , username);
      // after creating the form data we send it to the actual endpoint using axios note : axios is used for sending and receiving http requests and more 
      console.log("sending login request with username and password ");
      const response = await axios.post('http://localhost:8000/auth/token', formData, {
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded' ,
           'Accept' : 'applicaton/json'
          },
      });

      const accessToken = response.data.access_token; // this part now extracts the accessToken from the response from fastapi 
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; // the token is then added to the header files for requests so that it can be addedd to all the outgoing requests 
      localStorage.setItem('token', accessToken); // we the store the token locally in the local storage , so that apart from being accessible on the headers it is alse accessible localy 
      // setUser(response.data); // we the update the user variable in the useState hook with the user data from the response

      // we will do thi setUser a little different for now we will get the actual specific data that we want 
      // we will first decode the jwt token 
      const payload = JSON.parse(atob(accessToken.split('.')[1]));

      interface UserIdAndUsernameInterface {
        id : number;
        username : string;
      }

      // since the data from payload is of type any we need to convert it ot the desired string and number types
      const userIdAndUsername : UserIdAndUsernameInterface = {
        id : parseFloat(payload.id,),
        username : String(payload.sub),
      }
      setUser(userIdAndUsername)

      // before redirecting to the dashboard we upadte the usedata in the react store with the userid and the username 
      dispatch(updateUserIdAndUsername(userIdAndUsername))

      router.push('/dashboard'); // we then redirect the user to the landing page or a relevant page after loggin in now 
      // return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => { // this is now the logout functoin , which is also share across all of the app 
    setUser(null); // we begin by setting the usr to null so that there is no user currently logged in 
    delete axios.defaults.headers.common['Authorization']; // we the remove the token from the headers
    localStorage.removeItem('token'); // we also remove it from the local storage 
    router.push('/login'); // we then push the user to the login page 
  };

  return ( // and now this is the component that we now return which houses all of the login and logout logic and goes foward to share it across all of the components 
    <AuthContext.Provider value={{ user, login, logout , loading , signup}}>
      {children}
    </AuthContext.Provider>
  );
  
};

// Custom hook for using the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;