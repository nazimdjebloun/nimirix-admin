import { action } from "./_generated/server";
import { createAuth } from "./auth";
import { api } from "./_generated/api";

const PASSWORD = "niifler2001";

const ROLES = [
  "admin",
  "productManager",
  "leadProductManager",
  "dev",
  "leadDev",
  "designer",
  "leadDesigner",
  "qa",
  "leadQa",
  "devops",
  "leadDevops",
  "sales",
  "leadSales",
  "user",
];

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

export const seedRoleUsers = action({
  args: {},
  handler: async (ctx) => {
    console.log("--- Starting ALL Role-Based Users Seed ---");

    const auth = createAuth(ctx);

    for (const role of ROLES) {
      const email = `${role.toLowerCase()}@nimirix.com`;
      const name = `${role.charAt(0).toUpperCase() + role.slice(1)} User`;

      console.log(`Creating user: ${email} with role: ${role}`);
      try {
        const response = await auth.api.signUpEmail({
          body: {
            email,
            password: PASSWORD,
            name,
          },
        });

        if (response && response.user) {
          console.log(`User ${email} created. Updating role to ${role}...`);
          await ctx.runMutation(api.users.updateUserRole, {
            userId: response.user.id,
            role,
          });
          console.log(`User ${email} role updated successfully.`);
        }
      } catch (error) {
        console.error(`Error creating user ${email}:`, error);
      }
    }
    console.log("--- Finished Seeding All Role Users ---");
  }
});