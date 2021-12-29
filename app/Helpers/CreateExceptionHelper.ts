import { Exception } from '@poppinss/utils'

type NotIntegratedProps = {
  integrationName: string
  entityName: string
}

export const exceptionsHelper = {
  idNotFoundException: (entityName: string): never => {
    throw new Exception(`${entityName} Id does not exists.`, 404)
  },
  notIntegratedException: ({ integrationName, entityName }: NotIntegratedProps) => {
    throw new Exception(`${entityName} is not a ${integrationName} integration.`)
  },
}
