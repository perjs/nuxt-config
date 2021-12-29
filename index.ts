import { defineNuxtModule } from '@nuxt/kit'
import { promises as fs } from 'fs'
import path from 'path'
import consola from 'consola'

export interface ConfigModuleOptions {
  isBuildVersionEnabled: boolean
  isCacheVersionEnabled: boolean
}

const defaultOptions: ConfigModuleOptions = {
  isBuildVersionEnabled: false,
  isCacheVersionEnabled: true,
}

export default defineNuxtModule({
  hooks: {
    async 'vite:extend'({ nuxt, config }) {
      const start = new Date().getTime()
      const configFileContent = require('config')
      try {
        const cacheVersion = await fs.readFile(path.resolve(nuxt.options.srcDir, '.cache'), 'utf8') || ''
        configFileContent.server.cache.version = cacheVersion.replace('\n', '')
        consola.info('Cache version: ' + configFileContent.server.cache.version)
      } catch (e) {
        consola.error('Cache version file not found. Add some function to create .cache file in your root directory or create it manually.')
      }
      await fs.writeFile(path.resolve(nuxt.options.buildDir, 'config.json'), JSON.stringify(configFileContent))
      nuxt.options.alias.config = path.resolve(nuxt.options.buildDir, 'config.json')
      config.resolve.alias.config = path.resolve(nuxt.options.buildDir, 'config.json')
      consola.info(`Config file created in ${new Date().getTime() - start}ms`)
    },
  },
  async setup(options, nuxt) {
    options = {
      ...defaultOptions,
      ...options,
    }

    const { isBuildVersionEnabled } = options

    if(isBuildVersionEnabled) {
      fs.writeFile(path.resolve(nuxt.options.rootDir, 'public/build-version.json'), JSON.stringify({
        version: Math.random().toString(36).substring(7),
        date: new Date().toISOString()
      }))
    }
  },
})
