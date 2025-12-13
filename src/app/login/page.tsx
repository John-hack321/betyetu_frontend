'use client'
import { useRouter } from "next/navigation";
import { useState , useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { signInFormValues, signInSchema } from "../schemas/auth";

import { useForm } from 'react-hook-form';
import { useAuth } from "../context/authContext";


export default function SignInPage(){

    const [isLoading , setIsLoading] = useState(false);
    const [isFormValid , setIsFormValid] = useState(false);
    const [error , setError ] = useState<string | null>(null);

    const router = useRouter();
    const {login} = useAuth();

    // so based on what i have seen so far this part donwn here till the mode part is from react-hook-form and is a hook function from react used to interact with the form and handle value submissions 
    const {
        register, // this connects an imput field to the form , binds its state and validation 
        handleSubmit, // wraps the onSubmit function and handles the validation + field extractoin automatically 
        formState: {errors}, // holds any validation errors , used to show messages to the user 
        watch, // this one lets us watch a field's live value in real time eg it lets us watch the email to control the signin button 
    } = useForm<signInFormValues>({
        resolver: zodResolver(signInSchema), // this ( zodResolver(signInSchema)) now connects zod a powerful schmea validatior to react-hook-form  , it thefore tells react-hook-form use this schmea to validate imput before calling the onSubmit function , if validation fails errors are added to formState.errors 
        defaultValues : {
            username : "",
            password : "", // these values here now prepopulate the form : in this case both fields are empty but we can pull from storage in case we need to remember the user 
        },
        mode : "onChange", // runs the validation as the user types , this is mostly great for disabling buttons live as the user interacts with the form 
    });

// this code down here is used to watch the email and the password fiedls , everytime the eamil or password feild changes the functoin inside useEffect is ran 
    const password = watch("password"); // this watch here allows to watch and track the specified values in real time ;
    const username = watch("username");

    useEffect(() => {
        setIsFormValid(!!username && !!password); // so this functio inside here is ran everytime there is a chnage in the email and password fields , and with this ran each time it means that the button component will be rerendered each time in doing so 
    }, [username , password]);

    const onSubmit = async (data : signInFormValues) => {
        try{
            setIsLoading(true);
            await login( data.username , data.password)
        }catch (error){
            console.error('there was an error signing you in ');
            setError('Failed to log in. Please check your credentials');
        }
        finally{
            setIsLoading(false);
        }
       }

    return (
        <div className = 'flex min-h-screen w-full bg-background-blue'>
            <div className = 'relative w-full lg:w-1/2 '>
            <div className = 'absolute left-8 top-6  p-2 '>
                <span className = 'text-xl font-bold tracking-tight text-yellow-components lowercase'>.peer</span>
                <span className="text-xl font-bold tracking-tight text-custom-white-text-color lowercase">stake</span>
            </div>  
            {/*sing up form */}
            <div className = "flex min-h-screen items-center justify-center">
                <div className = "w-full max-w-md p-8">
                    <h2 className = "mb-6 text-center text-2xl font-semibold text-custom-white-text-color ">Log in to your account?</h2>
                    <form onSubmit = {handleSubmit(onSubmit)}>
                        <div className = "mb-4">
                            <label htmlFor="username" className = "text-sm text-custom-white-text-color mb-1 block font-medium ">
                                Username
                            </label>
                            <input type="username"
                            id = "username"
                            placeholder="enter your username"
                            {...register("username")}
                            className="w-full p-2 placeholder:text-sm rounded-lg text-custom-white-text-color placeholder:text-gray-400 focus:ring-yellow-components focus:outline-none focus:ring-1 border border-gray-400"
                            />
                            {errors.username && (
                                <p className = "mt-1 text-red-500 text-xs">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>
                        <div className = 'mb-4 '>
                            <label htmlFor="password" className = 'mb-1 block text-sm font-medium text-custom-white-text-color'>
                                Password
                            </label>
                            <input type="password" 
                            id = "password" 
                            {...register("password")}
                            placeholder="enter your password"
                            className = " w-full text-custom-white-text-color focus:border-yellow-components focus:ring-1 focus:ring-black placeholder:text-sm placeholder:text-gray-400 p-2 focus:outline-none border-gray-400 border rounded-lg" />
                            {errors.password && (
                                <p className = "mt-1 text-xs text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        {/** the forgot password part */}
                        <div className="flex justify-between items-center mb-4">
                            <a 
                                href="/forgot-password" 
                                className="text-sm text-yellow-components hover:underline"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <button 
                        type = "submit"
                        disabled = {isLoading || !isFormValid}
                        className = {`my-4 w-full   rounded-full py-2.5 text-sm text-black bg-yellow-components border border-black font-bold text-center p-2 transition-colors ${isLoading ? "cursor-not-allowed bg-gray-400" : isFormValid ? "bg-black" : "bg-gray-400 cursor-not-allowed"} `}
                        >{isLoading ? (<span className = "flex justify-center  items-center">
                            <svg
        className="animate-spin h-5 w-5 mr-2 text-black"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        ></circle>
        <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 "
        ></path>
    </svg>
    Signing in...
                        </span>) :
                        ("sign in") }
                        </button>
                        <div className = "text-center">
                            <span className = "text-gray-200 text-sm">Don&apos;t have an account?
                                <a href="/signup" className = "ml-2 underline text-blue">Sign Up</a>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
            </div>
            {/* the right side of the sign up page  */}
            <div className = "hidden py-[3vh] pr-[3vh] lg:block lg:w-1/2">
            <div className = "hidden h-full rounded-3xl bg-gradient-to-b from-indigo-100 via-purple-100 to-[#5960d7] lg:block ">
                <div className = 'flex h-full flex-col p-12 '>
                    <div className = "flex h-full items-center justify-center">
                        <Image 
                        src="/cod_actual.png" 
                        alt="Chess game illustration" 
                        width={500} 
                        height={500}
                        className="rounded-lg hover:opacity-100"
                        priority
                        />
                        </div>
                        <div className = "w-full max-w-lg h-fit  p-2">
                            <div className = "mb-3 flex bg-indigo-100 w-fit rounded-2xl bg-opacity-40 px-3 py-1 ">
                                <span className = "uppercase tracking-wider text-purple-950 text-xs font-medium" >latest updates</span>
                            </div>
                            <h3 className = "xl:text-xl text-white text-lg 2xl:text-2xl 2xl:leading-10"> go to the tournaments sections and play completely anonymous tournaments with strangers from all over the world </h3>
                        </div>
                </div>
            </div>
            </div>
        </div>
    ) 
}


// so i guess we are going to follow copilot's advise where we will only do the thing in a way such that we follow the common patterns 
// if we encounter a difficult we use ai : and we will be done soon 




// the redux global state management may seem to have a few weird commnets this is because i was implementing it as I learn the concept too 