import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import CustomHelpers from 'App/Bindings/CustomHelpers'
import S3Service from 'App/Bindings/S3Service'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
    this.app.container.singleton('Omnileaf/S3Service', () => new S3Service())
    this.app.container.singleton('Omnileaf/CustomHelpers', () => new CustomHelpers())
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    // App is ready
    // Enable next lines to run scheduled tasks
    // const scheduler = this.app.container.use('Adonis/Addons/Scheduler')
    // scheduler.run()
    if (this.app.environment === 'web') {
      await import('../start/socket')
    }
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
