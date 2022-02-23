import { Exception } from '@poppinss/utils'
import { version as uuidVersion } from 'uuid'
import { validate as uuidValidate } from 'uuid'
import { string, types } from '@ioc:Adonis/Core/Helpers'

class UuidValidator {
  v1(uuid: string) {
    if (types.isNull(uuid) || string.isEmpty(uuid)) {
      throw new Exception("Id param can't be null", 400)
    }

    if (!(uuidValidate(uuid) && uuidVersion(uuid) === 1)) {
      throw new Exception('Id param must be uuid version 1', 400)
    }
    return uuid
  }

  v4(uuid: string) {
    if (types.isNull(uuid) || string.isEmpty(uuid)) {
      throw new Exception("Id param can't be null", 400)
    }

    if (!(uuidValidate(uuid) && uuidVersion(uuid) === 4)) {
      throw new Exception('Id param must be uuid version 4', 400)
    }
    return uuid
  }
}

export default new UuidValidator()
