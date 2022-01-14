import Redis from '@ioc:Adonis/Addons/Redis'
import UserListener from 'App/Listeners/User'

Redis.subscribe('test', UserListener.log)
