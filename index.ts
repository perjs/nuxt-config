import fs from 'fs'
import path from 'path'
import configFile from 'config'
import { Module } from '@nuxt/types'

export interface ConfigModuleOptions {
  isBuildVersionEnabled: boolean
  isCacheVersionEnabled: boolean
}

const defaultOptions: ConfigModuleOptions = {
  isBuildVersionEnabled: true,
  isCacheVersionEnabled: true
}

const configModule: Module = function (localOptions?: ConfigModuleOptions) {
  const {
    extendBuild,
    options: nuxtOptions
  } = this

  const options: ConfigModuleOptions = {
    ...defaultOptions,
    ...(nuxtOptions.config || {}),
    ...(localOptions || {})
  }

  const { isBuildVersionEnabled, isCacheVersionEnabled } = options

  extendBuild(function (config: any, _ctx) {
    // @ts-ignore
    const { buildDir } = this.buildContext.options

    if (isCacheVersionEnabled) {
      try {
        if (!configFile.server) {
          configFile.server = {
            cache: {
              version: null
            }
          }
        }
        configFile.server.cache.version = fs.readFileSync(path.resolve(nuxtOptions.rootDir, '.cache-version'), 'utf8').replace('\n', '')
      } catch (e) {
        console.log(e)
      }
    }

    fs.writeFileSync(path.resolve(buildDir, 'config.json'), JSON.stringify(configFile))
    config.resolve.alias.config = path.resolve(buildDir, 'config.json')

    if (isBuildVersionEnabled) {
      fs.writeFileSync(path.resolve(nuxtOptions.rootDir, 'static/build-version.json'), JSON.stringify({
        version: Math.random().toString(36).substring(7),
        date: new Date().toISOString()
      }))
    }
  })
}

export default configModule
