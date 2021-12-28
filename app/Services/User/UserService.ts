import User from 'App/Models/User'
import { Exception } from '@adonisjs/core/build/standalone'
import {
  DeleteUserRequest,
  EditGitlabIdRequest,
  RegisterUserResquest,
  ShowUserRequest,
  UpdateUserRequest,
} from '../../Interfaces/User/user-service.interfaces'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm'

class UserService {
  public async getAll(): Promise<ModelObject[]> {
    const users = await User.all()

    const usersSerialized = users.map((user) => user.serialize())

    return usersSerialized
  }

  public async getOne({ id }: ShowUserRequest): Promise<ModelObject> {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    return user.serialize()
  }

  public async register({ payload }: RegisterUserResquest): Promise<ModelObject> {
    const { email } = payload

    if (await User.findBy('email', email)) {
      throw new Exception('Email is already registered.', 409)
    }

    const user = await User.create(payload)

    return user.serialize()
  }

  public async update({ id, payload, bouncer }: UpdateUserRequest): Promise<ModelObject> {
    const { email } = payload
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    if (email) {
      const emailExists = await User.query().where('email', email).andWhereNot('id', user.id)
      if (emailExists.length) {
        throw new Exception('Email is already registered for another user.', 409)
      }
    }

    await bouncer.authorize('OwnUser', id)

    await user.merge(payload).save()

    return user!.serialize()
  }

  public async delete({ id, bouncer }: DeleteUserRequest): Promise<void> {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    await bouncer.authorize('OwnUser', id)

    await user.delete()
  }

  public async editGitalbId({ id, payload, bouncer }: EditGitlabIdRequest) {
    const { gitlabId } = payload
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found.', 404)
    }

    bouncer.authorize('OwnUser', user.id)

    user.gitlabId = gitlabId
    await user.save()

    return user
  }
}

export default new UserService()
