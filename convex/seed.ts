import { action } from "./_generated/server";
import { createAuth } from "./auth";

export const seedAdmin = action({
  args: {},
  handler: async (ctx) => {
    console.log("--- Starting Admin Account Seed ---");
    
    const email = "djeblounnazim2@gmail.com";
    const password = "niifler2001";
    const name = "Nazim Djebloun";

    try {
      console.log(`STEP 1: Initializing Better Auth instance...`);
      const auth = createAuth(ctx);
      
      const response = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name, 
        },
      });
      
      console.log("User created successfully", response);
    } catch(error) {
      console.log("Error creating user:", error);
      

    }
  }
});