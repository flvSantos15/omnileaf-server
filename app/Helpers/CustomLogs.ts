import Logger from '@ioc:Adonis/Core/Logger'

export const LogCreated = (instanciated: any) => {
  Logger.info(`${instanciated.constructor.name} created succesfuly.`)
}

export const LogList = (arr: Array<any>) => {
  if (arr.length) {
    Logger.info(`${arr[0].constructor.name}s list sended.`)
    return
  }
  Logger.warn('Could not find any data of that Entity in Database.')
}

export const LogShow = (instanciated: any) => {
  Logger.info(`Sended single ${instanciated.constructor.name}.`)
}

export const LogUpdated = (instanciated: any) => {
  Logger.info(`${instanciated.constructor.name} updated succesfully.`)
}

export const LogDeleted = (instanciated: any) => {
  Logger.info(`${instanciated.constructor.name} deleted succesfully.`)
}
