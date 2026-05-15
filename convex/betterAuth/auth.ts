// import { DataModel } from '../_generated/dataModel';
// import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { createAuth } from '../auth'


// Export a static instance for Better Auth schema generation
/* eslint-disable */
export const auth = createAuth({} as any)
// currently not enough support in documentation to check if this typing work or not.
// export const auth = createAuth({} as unknown as GenericCtx<DataModel>)
