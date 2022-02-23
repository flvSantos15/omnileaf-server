import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Screenshot from 'App/Models/Screenshot'
import { dummyScreenshot } from 'Database/seeders-constants'

export default class ScreenshotSeeder extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const screenshot = await Screenshot.find(dummyScreenshot.id)

    if (screenshot) return

    await Screenshot.createMany([dummyScreenshot, { ...dummyScreenshot, id: undefined }])
  }
}
