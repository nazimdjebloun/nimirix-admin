import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access"

export const statement = {
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

/**
 * Base roles
 */
export const admin = ac.newRole({
  ...adminAc.statements,
})

export const user = ac.newRole({
  ...userAc.statements,
})

/**
 * Department roles (inherit basic user permissions)
 */
export const sales = ac.newRole({
  ...userAc.statements,
})

export const productManager = ac.newRole({
  ...userAc.statements,
})

export const dev = ac.newRole({
  ...userAc.statements,
})

export const designer = ac.newRole({
  ...userAc.statements,
})

export const qa = ac.newRole({
  ...userAc.statements,
})

export const devops = ac.newRole({
  ...userAc.statements,
})

/**
 * Lead roles (slightly elevated permissions later)
 */
export const leadSales = ac.newRole({
  ...userAc.statements,
})

export const leadProductManager = ac.newRole({
  ...userAc.statements,
})

export const leadDev = ac.newRole({
  ...userAc.statements,
})

export const leadDesigner = ac.newRole({
  ...userAc.statements,
})

export const leadQa = ac.newRole({
  ...userAc.statements,
})

export const leadDevops = ac.newRole({
  ...userAc.statements,
})