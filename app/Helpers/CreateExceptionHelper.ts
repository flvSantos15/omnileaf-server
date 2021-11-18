import { Exception } from '@poppinss/utils'

export const exceptionsHelper = {
  idNotFoundException: (entityName: string) => {
    throw new Exception(`${entityName} Id does not exists.`, 404)
  },
}
