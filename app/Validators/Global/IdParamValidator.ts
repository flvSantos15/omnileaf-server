import { Exception } from '@poppinss/utils'
import { version as uuidVersion } from 'uuid'
import { validate as uuidValidate } from 'uuid'
import Logger from '@ioc:Adonis/Core/Logger'

export const validateIdParam = (uuid: string) => {
  if (!(uuidValidate(uuid) && uuidVersion(uuid) === 4)) {
    Logger.warn('Param id must be uuidv4')
    throw new Exception('Param id must be uuidv4', 400)
  }
  return uuid
}
