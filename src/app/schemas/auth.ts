import {z} from "zod";

export const signInSchema = z.object({
    username : z.string().min(3, 'username must be of altleast 3 characters'),
    password : z.string().min(6 , "Password must be atleast 6 characters "),
}
)

export const signUpSchema = z.object({
    username: z.string().min(6, "The username must be at least 6 characters"),
    email: z.string().email("Invalid email"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const transactoinSchema = z.object({
    money : z.number().int().min(1 , {message : "amount must be a whole number greater than 0"})
})

// in order to use these schmeas we will have to export them 

export type signInFormValues = z.infer<typeof signInSchema> 
export type SignUpFormValues = z.infer<typeof signUpSchema>
export type TransactionFormValues = z.infer<typeof transactoinSchema >

{/* 
    so aa seen zod is the best in handling user forms and doing everything form related 
    in the schemas folder we define the auth.ts file in which we define the schemas for our form and how they will be accepted 
    
     */}