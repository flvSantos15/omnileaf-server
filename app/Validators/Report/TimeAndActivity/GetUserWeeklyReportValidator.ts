import { Exception } from '@adonisjs/core/build/standalone'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

const validatorSchema = schema.create({
  start: schema.date(),
  end: schema.date(),
  userId: schema.string({}, [rules.uuid({ version: 4 })]),
  organizationId: schema.string({}, [rules.uuid({ version: 4 })]),
})

class GetUserWeeklyReportValidator {
  public async validate(data: any) {
    const { valid, error } = await validator
      .validate({ schema: validatorSchema, data, reporter: validator.reporters.api })
      .then(() => {
        return { valid: true, error: undefined }
      })
      .catch((err) => {
        return { valid: false, error: err }
      })

    if (!valid) {
      console.log(error)
      throw new Exception(error.messages, 400)
    }
  }
}

export default new GetUserWeeklyReportValidator()
