import * as core from '@actions/core'
import {getOctokit, context} from '@actions/github'
import fs from 'fs'
import propertiesReader, {Value} from 'properties-reader'

type Inputs = {
  propertiesPath: string
  propertyName: string
  tagPrefix: string
  tagSuffix: string
  githubToken: string
}

function getInputs(): Inputs {
  return {
    propertiesPath: core.getInput('properties_path', {required: true}),
    propertyName: core.getInput('property_name', {required: true}),
    tagPrefix: core.getInput('tag_prefix'),
    tagSuffix: core.getInput('tag_suffix'),
    githubToken: core.getInput('github_token', {required: true})
  }
}

function loadProperty(propertiesPath: string, propertyName: string): Value {
  if (!fs.existsSync(propertiesPath)) {
    throw Error(
      `The file path for properties does not exist or is not found: ${propertiesPath}`
    )
  }

  const properties = propertiesReader(propertiesPath)
  const value = properties.get(propertyName)

  if (value === null) {
    throw Error(
      `The property ${propertyName} does not exist in ${propertiesPath}`
    )
  }

  return value
}

async function run(): Promise<void> {
  const {propertiesPath, propertyName, tagPrefix, tagSuffix, githubToken} =
    getInputs()

  const versionName = loadProperty(propertiesPath, propertyName)
  core.debug(`Detected version ${versionName}`)
  core.setOutput('version', versionName)

  const tagName = `${tagPrefix}${versionName}${tagSuffix}`
  core.info(`Setting tag name to ${tagName}`)

  const octokit = getOctokit(githubToken)

  core.info(`Creating release for ${tagName}`)
  const {owner, repo} = context.repo

  try {
    await octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      generate_release_notes: true,
      target_commitish: context.sha
    })
  } catch (error) {
    core.warning(`"${tagName}" tag already exists.`)
    return
  }
}

run()
  .then(() => core.info('done!'))
  .catch(e => core.setFailed(e))
