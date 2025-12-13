'use client'
import { useRouter } from "next/navigation";
import { useState , useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { SignUpFormValues , signInFormValues, signUpSchema } from "../schemas/auth";

import { useAuth } from "../context/authContext";

import { useForm } from 'react-hook-form';



export default function SignUpPage(){

    const [isLoading , setIsLoading] = useState(false);
    const [isFormValid , setIsFormValid] = useState(false);
    const [error , setError ] = useState<string | null>(null);
    const router = useRouter();

    const {signup} = useAuth();
    const {
        register,
        handleSubmit,
        formState: {errors},
        watch,
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues : {
            username : "",
            email : "",
            phone : "",
            password : "",
        },
        mode : "onChange",
    });

// this code down here is used to watch the email and the password fiedls , everytime the eamil or password feild changes the functoin inside useEffect is ran 
    const email = watch("email");
    const password = watch("password");
    const username = watch("username");
    const phone = watch("phone");

    useEffect(() => {
        setIsFormValid(!!email && !!password); // so this functio inside here is ran everytime there is a chnage in the email and password fields , and with this ran each time it means that the button component will be rerendered each time in doing so 
    }, [email , password]);

    const onSubmit = async (data : SignUpFormValues) => {
        try{
            setIsLoading(true);
            await signup(data.username , data.email ,data.phone , data.password);
        }catch(error){
            console.log("error signing you up")
            throw error;
        }finally{
            setIsLoading(false)
        }
    }

{/*
    const onSubmit = async (data : SignUpFormValues) => {
        setIsLoading(true);
        setError(null);
        // const result = await signUp(data);
        await new Promise((resolve) => setTimeout(resolve , 1000))

    }
*/}

    return (
        <div className='flex min-h-screen w-full overflow-hidden bg-background-blue'>
            <div className='relative flex-1 lg:flex-none lg:w-1/2 overflow-y-auto'>
            <div className = 'absolute left-8 top-6  p-2 '>
                <span className = 'text-xl font-bold tracking-tight text-yellow-components lowercase'>.peer</span>
                <span className="text-xl font-bold tracking-tight text-custom-white-text-color">stake</span>
            </div>  
            {/*sing up form */}
            <div className = "flex min-h-screen items-center justify-center">
                <div className = "w-full max-w-md p-8">
                    <h2 className = "mb-6 text-center text-2xl font-semibold text-custom-white-text-color ">Create your account?</h2>
                    <form onSubmit = {handleSubmit(onSubmit)}>
                        <div className = "mb-4">
                            <label htmlFor="username" className = "mb-1 block text-sm font-medium text-custom-white-text-color">
                                Username
                            </label>
                            <input type="username" 
                            id="username"
                            {...register("username")}
                            placeholder="enter your username"
                            className = "text-custom-white-text-color p-2 rounded-lg w-full  border border-gray-400 focus:ring-1 focus:ring-yellow-components focus:border-yellow-components focus:outline-none placeholder:text-gray-400  placeholder:text-sm "
                            />
                            {errors.username && (
                                <p className = "text-xs text-red-500 mt-1">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>
                        <div className = "mb-4">
                            <label htmlFor="email" className = 'mb-1 block text-sm  font-medium text-custom-white-text-color'>
                                Email
                            </label>
                            <input 
                            type="email"
                            id = "email"
                            {...register("email")}
                            placeholder="enter your email address"
                            className = "w-full text-custom-white-text-color rounded-lg border border-gray-400 p-2 placeholder:text-sm placeholder:text-gray-400 focus:border-yellow-components focus:outline-none focus:ring-yellow-components focus:ring-1"  />
                            {errors.email && (
                                <p className = "text-xs mt-1 text-red-500">
                                    {errors.email.message}
                                </p>
                            )}                        </div>

                        <div className = "mb-4">
                            <label htmlFor="phone" className = "mb-1 block text-sm font-medium text-custom-white-text-color">
                                Phone
                            </label>
                            <input type="tel"
                            id = "phone"
                            {...register("phone")}
                            placeholder="enter your phone number"
                            className = "text-custom-white-text-color border focus:ring-yellow-components focus:ring-1 border-gray-400 placeholder:text-gray-400 placeholder:text-xs focus:border-yellow-components  w-full p-2 rounded-lg focus:outline-none"/>
                            {errors.phone && (
                                <p className = "text-xs text-red-500 mt-1">
                                    {errors.phone.message}
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
                            className = " w-full text-custom-white-text-color focus:border-yellow-components focus:ring-1 focus:ring-yellow-components placeholder:text-sm placeholder:text-gray-400 p-2 focus:outline-none border-gray-400 border rounded-lg" />
                            {errors.password && (
                                <p className = "mt-1 text-xs text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <button 
                        type = "submit"
                        disabled = {isLoading || !isFormValid}
                        className = {`my-4 w-full rounded-full py-2.5 text-sm ${isFormValid ? 'text-black' : 'text-custom-white-text-color'} bg-transparent border border-yellow-components font-bold text-center p-2 transition-colors ${isLoading ? 'cursor-not-allowed bg-gray-400' : isFormValid ? 'bg-yellow-components' : 'bg-gray-400 cursor-not-allowed'}`}
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
      Creating account...
                        </span>) :
                        ("signup") }
                        </button>
                        <div className = "text-center">
                            <span className = "text-custom-white-text-color text-sm">already have an account
                                <a href="/login" className = "ml-2 underline text-blue">Sign in</a>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
            </div>
            {/* the right side of the sign up page  */}
            <div className="hidden lg:block lg:w-1/2 overflow-hidden">
            <div className="h-full rounded-3xl bg-gradient-to-b from-indigo-100 via-purple-100 to-[#5960d7] overflow-y-auto">
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
