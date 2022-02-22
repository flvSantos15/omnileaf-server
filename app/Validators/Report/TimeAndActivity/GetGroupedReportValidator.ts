import { Exception } from '@adonisjs/core/build/standalone'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

const validatorSchema = schema.create({
  start: schema.date(),
  end: schema.date(),
  userId: schema.string({}, [rules.uuid({ version: 4 })]),
  organizationId: schema.string({}, [rules.uuid({ version: 4 })]),
  groupBy: schema.string(),
})

class GetGroupedReportValidator {
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

    const validGroupBys = ['date', 'project', 'task', 'client']
    const groupByIsInvalid = !validGroupBys.includes(data.groupBy)

    if (groupByIsInvalid) {
      throw new Exception('Invalid groupBy clause', 400)
    }
  }
}

export default new GetGroupedReportValidator()
